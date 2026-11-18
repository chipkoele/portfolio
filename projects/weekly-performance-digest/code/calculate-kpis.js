// ===== Weekly Performance Digest – calculations =====
// Per channel: last week vs the week before (week-on-week),
// cost per MQL, MQL→SQL %, and the gap to target.

const rows = $('Parse weekly data').all().map(i => i.json);
const targetRows = $('Parse targets').all().map(i => i.json);

const num = v => Number(String(v ?? '').replace(',', '.')) || 0;
const round = (v, d = 0) => v === null ? null : Math.round(v * 10 ** d) / 10 ** d;
const pctChange = (now, before) => (before ? round((now - before) / before * 100, 1) : null);

// 1. Newest week in the sheet = "this week", the one before = "last week"
const weeks = [...new Set(rows.map(r => r.week_start))].sort();
const lastWeek = weeks[weeks.length - 1];
const prevWeek = weeks[weeks.length - 2];

// 2. Targets as a lookup: channel -> targets
const targets = {};
for (const t of targetRows) {
  targets[t.channel] = {
    cost_per_mql: t.target_cost_per_mql_eur === '' ? null : num(t.target_cost_per_mql_eur),
    mqls_per_week: num(t.target_mqls_per_week),
    mql_to_sql_pct: num(t.target_mql_to_sql_pct),
  };
}

// 3. Metrics for one row
function metrics(r) {
  const spend = num(r.spend_eur), mqls = num(r.mqls), sqls = num(r.sqls);
  return {
    spend, clicks: num(r.clicks), sessions: num(r.sessions),
    form_submissions: num(r.form_submissions), mqls, sqls,
    cost_per_mql: spend > 0 && mqls > 0 ? round(spend / mqls) : null,
    mql_to_sql_pct: mqls > 0 ? round(sqls / mqls * 100, 1) : null,
  };
}

function compare(name, nowRaw, beforeRaw) {
  const now = metrics(nowRaw), before = metrics(beforeRaw);
  const t = targets[name] || {};
  return {
    channel: name,
    this_week: now,
    last_week: before,
    wow_change_pct: {
      spend: pctChange(now.spend, before.spend),
      mqls: pctChange(now.mqls, before.mqls),
      sqls: pctChange(now.sqls, before.sqls),
      cost_per_mql: pctChange(now.cost_per_mql, before.cost_per_mql),
    },
    target: t,
    vs_target: {
      cost_per_mql_pct: now.cost_per_mql !== null && t.cost_per_mql
        ? round((now.cost_per_mql / t.cost_per_mql - 1) * 100, 1) : null,
      mqls_vs_target: t.mqls_per_week ? now.mqls - t.mqls_per_week : null,
      mql_to_sql_pts: now.mql_to_sql_pct !== null && t.mql_to_sql_pct
        ? round(now.mql_to_sql_pct - t.mql_to_sql_pct, 1) : null,
    },
  };
}

// 4. One block per channel + a TOTAL
const channels = [...new Set(rows.map(r => r.channel))];
const sumWeek = week => {
  const s = {};
  for (const r of rows.filter(r => r.week_start === week))
    for (const k of ['spend_eur', 'clicks', 'sessions', 'form_submissions', 'mqls', 'sqls'])
      s[k] = (s[k] || 0) + num(r[k]);
  return s;
};

const result = channels.map(ch =>
  compare(ch,
    rows.find(r => r.channel === ch && r.week_start === lastWeek) || {},
    rows.find(r => r.channel === ch && r.week_start === prevWeek) || {})
);
const total = compare('TOTAL', sumWeek(lastWeek), sumWeek(prevWeek));

return [{ json: { week: lastWeek, previous_week: prevWeek, total, channels: result } }];
