import type { NewsletterIssue, Subscriber } from '@/types/newsletter'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.RENDER_EXTERNAL_URL || 'https://signal-newsletter.onrender.com'

// Colour palette — warm beige & rose
const C = {
  bg:          '#faf7f4',
  card:        '#ffffff',
  border:      '#ecddd0',
  headline:    '#2d1f14',
  body:        '#4a3728',
  muted:       '#8a6f5e',
  accent:      '#c9956b',
  accentLight: '#f4ece0',
  accentDark:  '#8f6b42',
  rose:        '#d4623a',
  roseLight:   '#fdf4f0',
  divider:     '#e8d5c4',
  pill:        '#f0e5d8',
  pillText:    '#8f6b42',
}

function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    llm_models: 'Models & LLMs', ai_tools: 'AI Tools', business_ai: 'Business AI',
    research: 'Research', ai_art_creative: 'Creative AI', robotics: 'Robotics',
    policy_regulation: 'Policy & Ethics', startups_funding: 'Funding', ai_jobs: 'Careers',
    tutorials_howto: 'Tutorial',
  }
  return map[cat] || cat
}

function pill(label: string): string {
  return `<span style="display:inline-block;background:${C.pill};color:${C.pillText};font-size:11px;font-weight:600;padding:3px 10px;border-radius:99px;letter-spacing:0.5px;text-transform:uppercase">${label}</span>`
}

function divider(): string {
  return `<tr><td style="padding:0 0 24px"><div style="height:1px;background:${C.divider}"></div></td></tr>`
}

export function buildEmailHtml(issue: NewsletterIssue, subscriber: Subscriber): string {
  const unsubUrl = `${BASE_URL}/unsubscribe?token=${subscriber.unsubscribeToken}`
  const prefsUrl = `${BASE_URL}/preferences?token=${subscriber.unsubscribeToken}`

  const storiesHtml = issue.stories.map((s) => `
    <tr>
      <td style="padding:0 0 20px">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:0 0 6px">${pill(categoryLabel(s.category))}</td>
          </tr>
          <tr>
            <td>
              <a href="${s.url}" style="font-family:Georgia,serif;font-size:17px;font-weight:700;color:${C.headline};text-decoration:none;line-height:1.35">${s.title}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0 0">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:${C.body};line-height:1.65">${s.aiSummary}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0 0">
              <a href="${s.url}" style="font-family:Arial,sans-serif;font-size:12px;color:${C.accent};text-decoration:none;font-weight:600">Read more &rarr; <span style="color:${C.muted};font-weight:400">${s.source}</span></a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="padding:0 0 20px"><div style="height:1px;background:${C.divider}"></div></td></tr>
  `).join('')

  const toolSpotlightHtml = issue.toolSpotlight ? `
    <tr>
      <td style="padding:0 0 28px">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.accentLight};border-radius:12px;border:1px solid ${C.border}">
          <tr>
            <td style="padding:20px 24px">
              <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:${C.accent};text-transform:uppercase;letter-spacing:1px">Tool Spotlight</p>
              <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:17px;font-weight:700;color:${C.headline}">${issue.toolSpotlight.name}</p>
              <p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:14px;color:${C.body};line-height:1.6">${issue.toolSpotlight.description}</p>
              <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:13px;color:${C.muted};line-height:1.6;font-style:italic">${issue.toolSpotlight.why}</p>
              <a href="${issue.toolSpotlight.url}" style="font-family:Arial,sans-serif;font-size:12px;color:${C.accentDark};font-weight:600;text-decoration:none">Try it &rarr;</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  ` : ''

  const paperHtml = issue.paperOfTheDay ? `
    <tr>
      <td style="padding:0 0 28px">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8f4f0;border-radius:12px;border:1px solid ${C.border}">
          <tr>
            <td style="padding:20px 24px">
              <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:${C.rose};text-transform:uppercase;letter-spacing:1px">Research Paper of the Day</p>
              <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:16px;font-weight:700;color:${C.headline}">${issue.paperOfTheDay.title}</p>
              <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:14px;color:${C.body};line-height:1.6">${issue.paperOfTheDay.summary}</p>
              <p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:13px;color:${C.muted};line-height:1.6"><strong style="color:${C.body}">Why it matters:</strong> ${issue.paperOfTheDay.whyItMatters}</p>
              <a href="${issue.paperOfTheDay.url}" style="font-family:Arial,sans-serif;font-size:12px;color:${C.rose};font-weight:600;text-decoration:none">Read paper &rarr;</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  ` : ''

  const fundingHtml = issue.fundingRound ? `
    <tr>
      <td style="padding:0 0 28px">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fdfaf8;border-radius:12px;border:1px solid ${C.border}">
          <tr>
            <td style="padding:20px 24px">
              <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:${C.accentDark};text-transform:uppercase;letter-spacing:1px">Funding News</p>
              <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:17px;font-weight:700;color:${C.headline}">${issue.fundingRound.company} <span style="font-size:15px;color:${C.accent}">${issue.fundingRound.amount}</span></p>
              <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:14px;color:${C.body};line-height:1.6">${issue.fundingRound.what}</p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:${C.muted};font-style:italic">${issue.fundingRound.whyItMatters}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  ` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<title>${issue.headline}</title>
</head>
<body style="margin:0;padding:0;background-color:${C.bg};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bg}">
  <tr>
    <td align="center" style="padding:32px 16px">

      <!-- Container -->
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%">

        <!-- Header -->
        <tr>
          <td style="padding:0 0 24px">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <p style="margin:0;font-family:Georgia,serif;font-size:26px;font-weight:700;color:${C.headline};letter-spacing:-0.5px">Signal</p>
                  <p style="margin:2px 0 0;font-family:Arial,sans-serif;font-size:12px;color:${C.muted};letter-spacing:1px;text-transform:uppercase">Your Daily AI Intelligence</p>
                </td>
                <td align="right" style="vertical-align:bottom">
                  <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:${C.muted}">${issue.date}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Thin accent line -->
        <tr>
          <td style="padding:0 0 28px">
            <div style="height:2px;background:linear-gradient(to right,${C.accent},${C.rose},${C.accentLight})"></div>
          </td>
        </tr>

        <!-- Intro -->
        <tr>
          <td style="padding:0 0 28px">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:15px;color:${C.body};line-height:1.7">${issue.intro}</p>
          </td>
        </tr>

        <!-- Top Story -->
        <tr>
          <td style="padding:0 0 28px">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.rose};border-radius:14px">
              <tr>
                <td style="padding:28px 28px 24px">
                  <p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:1.5px">Top Story</p>
                  <p style="margin:0 0 12px;font-family:Georgia,serif;font-size:21px;font-weight:700;color:#ffffff;line-height:1.3">
                    <a href="${issue.topStory.url}" style="color:#ffffff;text-decoration:none">${issue.topStory.title}</a>
                  </p>
                  <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:14px;color:rgba(255,255,255,0.9);line-height:1.7">${issue.topStory.deepDive}</p>
                  <a href="${issue.topStory.url}" style="display:inline-block;background:rgba(255,255,255,0.2);color:#ffffff;font-family:Arial,sans-serif;font-size:13px;font-weight:600;padding:9px 20px;border-radius:99px;text-decoration:none;border:1px solid rgba(255,255,255,0.3)">Read full story &rarr;</a>
                  <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.55)">${issue.topStory.source}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Stories -->
        <tr>
          <td>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${storiesHtml}
            </table>
          </td>
        </tr>

        <!-- Tool Spotlight -->
        ${toolSpotlightHtml}

        <!-- Paper of the Day -->
        ${paperHtml}

        <!-- Funding -->
        ${fundingHtml}

        <!-- Consultant's Corner -->
        ${issue.consultantCorner ? `
        <tr>
          <td style="padding:0 0 28px">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,${C.accentLight},#fdf8f4);border-radius:14px;border:1px solid ${C.border}">
              <tr>
                <td style="padding:24px 28px">
                  <p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:${C.rose};text-transform:uppercase;letter-spacing:1.5px">Consultant's Corner</p>
                  <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:15px;color:${C.headline};line-height:1.65;font-style:italic">${issue.consultantCorner}</p>
                  <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:${C.accent};font-weight:600">— Marium, AI Strategy Consultant</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ` : ''}

        <!-- Quote -->
        <tr>
          <td style="padding:0 0 28px">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:3px solid ${C.accent}">
              <tr>
                <td style="padding:8px 20px">
                  <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:16px;color:${C.headline};line-height:1.5;font-style:italic">&ldquo;${issue.quote.text}&rdquo;</p>
                  <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:${C.muted}">— ${issue.quote.author}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Closing note -->
        <tr>
          <td style="padding:0 0 32px">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:${C.body};line-height:1.7">${issue.closingNote}</p>
            <p style="margin:8px 0 0;font-family:Georgia,serif;font-size:14px;color:${C.accent};font-style:italic">— Marium</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 0 0;border-top:1px solid ${C.divider}">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center">
                  <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:16px;color:${C.accent}">Signal by ThreeAI</p>
                  <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:12px;color:${C.muted}">Your daily dose of AI intelligence</p>
                  <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:${C.muted}">
                    <a href="${prefsUrl}" style="color:${C.accent};text-decoration:none">Manage preferences</a>
                    &nbsp;&middot;&nbsp;
                    <a href="${unsubUrl}" style="color:${C.muted};text-decoration:none">Unsubscribe</a>
                  </p>
                  <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:10px;color:${C.muted}">
                    You are receiving this because you subscribed at ${BASE_URL}.<br>
                    ThreeAI &middot; In compliance with GDPR &amp; CAN-SPAM Act.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`
}

export function buildConfirmationEmail(subscriber: Subscriber): string {
  const confirmUrl = `${BASE_URL}/confirm?token=${subscriber.confirmToken}`

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Confirm your Signal subscription</title></head>
<body style="margin:0;padding:0;background:${C.bg}">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bg}">
  <tr><td align="center" style="padding:48px 16px">
    <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:${C.card};border-radius:16px;border:1px solid ${C.border}">
      <tr><td style="padding:40px 40px 32px;text-align:center">
        <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:28px;color:${C.accent}">Signal</p>
        <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:12px;color:${C.muted};letter-spacing:1px;text-transform:uppercase">by ThreeAI</p>
        <div style="width:56px;height:56px;background:${C.accentLight};border-radius:99px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:24px">✉️</div>
        <h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:24px;color:${C.headline}">One click to confirm</h1>
        <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:15px;color:${C.body};line-height:1.6">
          Hi ${subscriber.firstName}, you're almost in. Click below to confirm your subscription and start receiving your daily AI intelligence.
        </p>
        <a href="${confirmUrl}" style="display:inline-block;background:${C.rose};color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:700;padding:14px 36px;border-radius:99px;text-decoration:none">Confirm my subscription</a>
        <p style="margin:20px 0 0;font-family:Arial,sans-serif;font-size:12px;color:${C.muted}">This link expires in 48 hours. If you didn't sign up, ignore this email.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`
}
