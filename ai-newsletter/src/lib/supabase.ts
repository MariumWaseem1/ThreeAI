import { createClient } from '@supabase/supabase-js'
import type { Subscriber, SubscriberPreferences } from '@/types/newsletter'
import { DEFAULT_PREFERENCES } from '@/types/newsletter'
import crypto from 'crypto'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars not set')
  return createClient(url, key)
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function generateReferralCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

// ─── Subscriber CRUD ────────────────────────────────────────────────────────

export async function createSubscriber(
  email: string,
  firstName: string,
  prefs: Partial<SubscriberPreferences> = {},
  referredBy?: string
): Promise<Subscriber> {
  const supabase = getSupabase()

  const subscriber: Omit<Subscriber, 'id'> = {
    email: email.toLowerCase().trim(),
    firstName: firstName.trim(),
    confirmed: false,
    confirmToken: generateToken(),
    unsubscribeToken: generateToken(),
    preferences: { ...DEFAULT_PREFERENCES, ...prefs },
    referralCode: generateReferralCode(),
    referredBy,
    createdAt: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('subscribers')
    .insert(subscriber)
    .select()
    .single()

  if (error) throw error
  return data as Subscriber
}

export async function getSubscriberByEmail(email: string): Promise<Subscriber | null> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('subscribers')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single()
  return data as Subscriber | null
}

export async function getSubscriberByToken(token: string, field: 'confirmToken' | 'unsubscribeToken'): Promise<Subscriber | null> {
  const supabase = getSupabase()
  const col = field === 'confirmToken' ? 'confirm_token' : 'unsubscribe_token'
  const { data } = await supabase
    .from('subscribers')
    .select('*')
    .eq(col, token)
    .single()
  return data as Subscriber | null
}

export async function confirmSubscriber(token: string): Promise<boolean> {
  const supabase = getSupabase()
  const { error } = await supabase
    .from('subscribers')
    .update({ confirmed: true, confirm_token: null })
    .eq('confirm_token', token)
  return !error
}

export async function unsubscribeByToken(token: string): Promise<boolean> {
  const supabase = getSupabase()
  const { error } = await supabase
    .from('subscribers')
    .delete()
    .eq('unsubscribe_token', token)
  return !error
}

export async function updatePreferences(
  token: string,
  prefs: Partial<SubscriberPreferences>
): Promise<boolean> {
  const supabase = getSupabase()
  // First get current prefs
  const { data } = await supabase
    .from('subscribers')
    .select('preferences')
    .eq('unsubscribe_token', token)
    .single()
  if (!data) return false

  const merged = { ...data.preferences, ...prefs }
  const { error } = await supabase
    .from('subscribers')
    .update({ preferences: merged })
    .eq('unsubscribe_token', token)
  return !error
}

export async function getAllConfirmedSubscribers(): Promise<Subscriber[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .eq('confirmed', true)
  if (error) throw error
  return (data || []) as Subscriber[]
}

// ─── SQL setup (run once via Supabase dashboard or migration) ────────────────
export const SUPABASE_SCHEMA = `
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  confirmed BOOLEAN DEFAULT FALSE,
  confirm_token TEXT,
  unsubscribe_token TEXT NOT NULL,
  preferences JSONB NOT NULL DEFAULT '{}',
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_confirm_token ON subscribers(confirm_token);
CREATE INDEX IF NOT EXISTS idx_subscribers_unsubscribe_token ON subscribers(unsubscribe_token);
`
