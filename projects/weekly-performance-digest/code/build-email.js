// ===== Weekly Performance Digest – build the email =====
// Combines the calculated KPIs with the AI recommendations into one HTML email.

const k = $('Calculate KPIs').first().json;
let recs = $json.content?.parts?.[0]?.text ?? $json.text ?? '';
recs = recs.replace(/```html|```/g, '').trim();   // remove code fences if the AI adds them

const eur = v => v === null || v === undefined ? '–' : '€' + Math.round(v).toLocaleString('en-GB');
const pct = v => v === null || v === undefined ? '–' : (v > 0 ? '+' : '') + v + '%';
const colour = v => v === null || v === undefined ? '#666' : v <= 0 ? '#1a7f37' : v <= 20 ? '#b58100' : '#cf222e';

const t = k.total;
const weekLabel = new Date(k.week).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const rows = k.channels.map(c => `
  <tr>
    <td style="padding:6px 8px;border-bottom:1px solid #eee">${c.channel}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${eur(c.this_week.spend)}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${c.this_week.mqls} <span style="color:#666">(${pct(c.wow_change_pct.mqls)})</span></td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${eur(c.this_week.cost_per_mql)}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;color:${colour(c.vs_target.cost_per_mql_pct)}">${pct(c.vs_target.cost_per_mql_pct)}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${c.this_week.mql_to_sql_pct ?? '–'}%</td>
  </tr>`).join('');

const html = `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:680px;color:#1f2328">
  <h2 style="margin:0 0 4px">Weekly Performance Digest</h2>
  <div style="color:#666;margin-bottom:16px">Week of ${weekLabel} vs previous week</div>

  <div style="background:#f6f8fa;border-radius:8px;padding:12px 16px;margin-bottom:20px;line-height:1.6">
    <b>${t.this_week.mqls} MQLs</b> (${pct(t.wow_change_pct.mqls)} WoW, target ${t.target.mqls_per_week}) ·
    <b>${t.this_week.sqls} SQLs</b> (${pct(t.wow_change_pct.sqls)}) ·
    <b>${eur(t.this_week.spend)}</b> spend (${pct(t.wow_change_pct.spend)}) ·
    blended cost per MQL <b>${eur(t.this_week.cost_per_mql)}</b> (target ${eur(t.target.cost_per_mql)})
  </div>

  <h3 style="margin:0 0 8px">Recommendations</h3>
  <div style="line-height:1.5;margin-bottom:20px">${recs}</div>

  <h3 style="margin:0 0 8px">Channel overview</h3>
  <table style="border-collapse:collapse;width:100%;font-size:14px">
    <tr style="background:#f6f8fa;text-align:right">
      <th style="padding:6px 8px;text-align:left">Channel</th><th style="padding:6px 8px">Spend</th>
      <th style="padding:6px 8px">MQLs (WoW)</th><th style="padding:6px 8px">Cost/MQL</th>
      <th style="padding:6px 8px">vs target</th><th style="padding:6px 8px">MQL→SQL</th>
    </tr>${rows}
  </table>

  <p style="color:#888;font-size:12px;margin-top:24px">
    Fictional sample data · Numbers calculated in code, recommendations by AI (check before acting) · Built with n8n + Gemini
  </p>
</div>`;

const subject = `Weekly digest ${weekLabel}: ${t.this_week.mqls} MQLs, ${eur(t.this_week.cost_per_mql)} per MQL`;

return [{ json: { subject, html } }];
