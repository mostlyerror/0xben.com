#!/usr/bin/env node
// X (Twitter) analytics for @mostly_error via the official API, pay-per-use.
// Reads credentials from .env (gitignored) — NEVER prints a secret.
//
//   tinyship x auth             # one-time: authorize @mostly_error, saves tokens to .env
//   tinyship x followers        # log follower count to the growth wall (commit+push)
//   tinyship x followers --dry  # just print, write nothing
//   tinyship x report [days]    # per-tweet performance, last N days (default 29, max 29)
//
// Auth model: OAuth 1.0a user context. The consumer key/secret identify the app
// (lives under the ClusterDesk developer account); the access token/secret are
// @mostly_error's, minted once by `auth` via the localhost callback dance.
// Non-public metrics (impressions, profile clicks) require this user context
// and only exist for tweets younger than ~30 days, hence the 29-day cap.
//
// Cost notes (pay-per-use, Feb 2026 pricing): reads are $0.005/post. A full
// `report` run reads ≤100 posts ≈ $0.50 worst case; `followers` is ~one read.

import { readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env");
const CALLBACK = "http://localhost:8723/callback";
const API = "https://api.x.com";

// ---------------------------------------------------------------------------
// .env — read/write without ever echoing values.
// ---------------------------------------------------------------------------
function readEnv() {
  const src = readFileSync(envPath, "utf8");
  const get = (k) => {
    const m = src.match(new RegExp(`^${k}=(.*)$`, "m"));
    return m ? m[1].trim() : "";
  };
  return {
    apiKey: get("X_API_KEY"),
    apiSecret: get("X_API_SECRET"),
    accessToken: get("X_ACCESS_TOKEN"),
    accessSecret: get("X_ACCESS_SECRET"),
  };
}

function writeTokens(token, secret) {
  let src = readFileSync(envPath, "utf8");
  src = src.replace(/^X_ACCESS_TOKEN=.*$/m, `X_ACCESS_TOKEN=${token}`);
  src = src.replace(/^X_ACCESS_SECRET=.*$/m, `X_ACCESS_SECRET=${secret}`);
  writeFileSync(envPath, src);
}

// ---------------------------------------------------------------------------
// OAuth 1.0a signing (HMAC-SHA1) — no deps, RFC 5849.
// ---------------------------------------------------------------------------
const pct = (s) =>
  encodeURIComponent(s).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());

function oauthHeader(method, url, { query = {}, oauthExtra = {}, token = "", tokenSecret = "" } = {}) {
  const { apiKey, apiSecret } = readEnv();
  const oauth = {
    oauth_consumer_key: apiKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: "1.0",
    ...(token ? { oauth_token: token } : {}),
    ...oauthExtra,
  };
  // Signature base: every oauth_* param AND every query param, sorted.
  const all = { ...oauth, ...query };
  const paramString = Object.keys(all)
    .sort()
    .map((k) => `${pct(k)}=${pct(all[k])}`)
    .join("&");
  const base = [method.toUpperCase(), pct(url), pct(paramString)].join("&");
  const signingKey = `${pct(apiSecret)}&${pct(tokenSecret)}`;
  oauth.oauth_signature = crypto.createHmac("sha1", signingKey).update(base).digest("base64");
  const header =
    "OAuth " +
    Object.keys(oauth)
      .sort()
      .map((k) => `${pct(k)}="${pct(oauth[k])}"`)
      .join(", ");
  return header;
}

async function api(method, path, { query = {}, token, tokenSecret } = {}) {
  const url = `${API}${path}`;
  const qs = new URLSearchParams(query).toString();
  const res = await fetch(qs ? `${url}?${qs}` : url, {
    method,
    headers: { Authorization: oauthHeader(method, url, { query, token, tokenSecret }) },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → HTTP ${res.status}: ${text.slice(0, 300)}`);
  return text;
}

// Signed call with the saved @mostly_error user context, JSON response.
async function userApi(path, query = {}) {
  const { accessToken, accessSecret } = readEnv();
  if (!accessToken || !accessSecret) {
    console.error("No access tokens in .env yet — run `tinyship x auth` first.");
    process.exit(1);
  }
  return JSON.parse(await api("GET", path, { query, token: accessToken, tokenSecret: accessSecret }));
}

// ---------------------------------------------------------------------------
// auth — three-legged OAuth 1.0a with a localhost callback. The request_token
// leg needs oauth_callback inside the signed params, the access_token leg
// needs oauth_verifier — both ride in via oauthExtra.
// ---------------------------------------------------------------------------
async function legOne() {
  const url = `${API}/oauth/request_token`;
  const header = oauthHeader("POST", url, { oauthExtra: { oauth_callback: CALLBACK } });
  const res = await fetch(url, { method: "POST", headers: { Authorization: header } });
  const text = await res.text();
  if (!res.ok) throw new Error(`request_token → HTTP ${res.status}: ${text.slice(0, 300)}`);
  const p = new URLSearchParams(text);
  if (p.get("oauth_callback_confirmed") !== "true") throw new Error("callback not confirmed by X");
  return { token: p.get("oauth_token"), secret: p.get("oauth_token_secret") };
}

async function legThree(reqToken, reqSecret, verifier) {
  const url = `${API}/oauth/access_token`;
  const header = oauthHeader("POST", url, {
    token: reqToken,
    tokenSecret: reqSecret,
    oauthExtra: { oauth_verifier: verifier },
  });
  const res = await fetch(url, { method: "POST", headers: { Authorization: header } });
  const text = await res.text();
  if (!res.ok) throw new Error(`access_token → HTTP ${res.status}: ${text.slice(0, 300)}`);
  const p = new URLSearchParams(text);
  return {
    token: p.get("oauth_token"),
    secret: p.get("oauth_token_secret"),
    screenName: p.get("screen_name"),
  };
}

async function runAuth() {
  const { apiKey, apiSecret } = readEnv();
  if (!apiKey || !apiSecret) {
    console.error("X_API_KEY / X_API_SECRET missing in .env — fill those in first.");
    process.exit(1);
  }

  const req = await legOne();

  // Leg 2: user authorizes in the browser; we catch the redirect locally.
  const verifier = await new Promise((resolve, reject) => {
    const server = createServer((r, s) => {
      const u = new URL(r.url, "http://localhost:8723");
      if (u.pathname !== "/callback") {
        s.writeHead(404).end();
        return;
      }
      const v = u.searchParams.get("oauth_verifier");
      s.writeHead(200, { "Content-Type": "text/html" });
      s.end("<body style='font-family:sans-serif'><h2>Authorized ✔</h2>You can close this tab and return to the terminal.</body>");
      server.close();
      v ? resolve(v) : reject(new Error("callback arrived without oauth_verifier (denied?)"));
    });
    server.listen(8723, () => {
      const authorizeUrl = `${API}/oauth/authorize?oauth_token=${encodeURIComponent(req.token)}`;
      console.log("Opening browser to authorize. Make sure you're logged in as @mostly_error.");
      console.log(`If it doesn't open: ${authorizeUrl}`);
      try {
        execFileSync("open", [authorizeUrl]);
      } catch {
        /* user can click the printed link */
      }
    });
    setTimeout(() => {
      server.close();
      reject(new Error("Timed out waiting for the callback (150s). Run auth again."));
    }, 150_000).unref();
  });

  const access = await legThree(req.token, req.secret, verifier);
  writeTokens(access.token, access.secret);
  console.log(`✅  Authorized as @${access.screenName}. Tokens saved to .env (not printed).`);
  if (access.screenName?.toLowerCase() !== "mostly_error") {
    console.log(`⚠️  Heads up: that's NOT @mostly_error. If you meant the maker account, log in as it in the browser and run \`tinyship x auth\` again.`);
  }
}

// ---------------------------------------------------------------------------
// followers — read public metrics, optionally log to the growth wall.
// ---------------------------------------------------------------------------
async function cmdFollowers(dry) {
  const me = await userApi("/2/users/me", { "user.fields": "public_metrics" });
  const m = me.data.public_metrics;
  console.log(`@${me.data.username} — followers: ${m.followers_count} · following: ${m.following_count} · posts: ${m.tweet_count}`);
  const args = ["mostly_error", String(m.followers_count)];
  if (dry) args.push("--dry");
  // growth.mjs appends the datapoint to lib/site.ts, commits, and pushes.
  execFileSync("node", [join(root, "scripts", "growth.mjs"), ...args], { cwd: root, stdio: "inherit" });
}

// ---------------------------------------------------------------------------
// report — per-tweet performance over the last N days (≤29: non-public
// metrics don't exist past ~30 days).
// ---------------------------------------------------------------------------
async function cmdReport(daysArg) {
  const days = Math.min(Number(daysArg) || 29, 29);
  const me = await userApi("/2/users/me");
  const start = new Date(Date.now() - days * 864e5).toISOString();

  const query = {
    max_results: "100",
    start_time: start,
    exclude: "retweets",
    "tweet.fields": "public_metrics,non_public_metrics,created_at,in_reply_to_user_id",
  };
  let body;
  let hasPrivate = true;
  try {
    body = await userApi(`/2/users/${me.data.id}/tweets`, query);
  } catch (e) {
    // Some apps/tiers reject non_public_metrics — degrade to public-only.
    hasPrivate = false;
    delete query["tweet.fields"];
    query["tweet.fields"] = "public_metrics,created_at,in_reply_to_user_id";
    body = await userApi(`/2/users/${me.data.id}/tweets`, query);
    console.log("(non-public metrics unavailable: " + e.message.slice(0, 120) + ")\n");
  }

  const tweets = body.data || [];
  if (!tweets.length) {
    console.log(`No posts in the last ${days} days.`);
    return;
  }

  const rows = tweets.map((t) => {
    const pub = t.public_metrics || {};
    const priv = t.non_public_metrics || {};
    const imp = priv.impression_count ?? pub.impression_count ?? 0;
    const eng =
      (pub.like_count || 0) + (pub.retweet_count || 0) + (pub.reply_count || 0) +
      (pub.quote_count || 0) + (pub.bookmark_count || 0);
    return {
      date: (t.created_at || "").slice(0, 10),
      kind: t.in_reply_to_user_id ? "reply" : "post",
      text: t.text.replace(/\s+/g, " ").slice(0, 48),
      imp,
      eng,
      rate: imp ? ((eng / imp) * 100).toFixed(1) + "%" : "—",
      profileClicks: priv.user_profile_clicks ?? "—",
      linkClicks: priv.url_link_clicks ?? "—",
      id: t.id,
    };
  });

  rows.sort((a, b) => b.imp - a.imp);

  console.log(`📈  @${me.data.username} — last ${days} days · ${rows.length} posts/replies (cost ≈ $${(rows.length * 0.005).toFixed(2)})\n`);
  const head = ["date", "kind", "imp", "eng", "rate", "👤clicks", "🔗clicks", "text"];
  console.log(head.join("  "));
  for (const r of rows) {
    console.log(
      [r.date, r.kind.padEnd(5), String(r.imp).padStart(5), String(r.eng).padStart(4), String(r.rate).padStart(6),
       String(r.profileClicks).padStart(7), String(r.linkClicks).padStart(7), `"${r.text}"`].join("  ")
    );
  }

  const tot = rows.reduce((a, r) => ({ imp: a.imp + r.imp, eng: a.eng + r.eng }), { imp: 0, eng: 0 });
  console.log(`\nTotals: ${tot.imp} impressions · ${tot.eng} engagements` + (tot.imp ? ` · ${((tot.eng / tot.imp) * 100).toFixed(1)}% rate` : ""));
  if (hasPrivate) {
    const pc = rows.reduce((a, r) => a + (typeof r.profileClicks === "number" ? r.profileClicks : 0), 0);
    console.log(`Profile clicks total: ${pc} (the number that turns into follows)`);
  }
}

// ---------------------------------------------------------------------------
const [sub, ...rest] = process.argv.slice(2);
try {
  if (sub === "auth") await runAuth();
  else if (sub === "followers") await cmdFollowers(rest.includes("--dry"));
  else if (sub === "report") await cmdReport(rest.find((a) => /^\d+$/.test(a)));
  else {
    console.log("Usage: tinyship x auth | followers [--dry] | report [days≤29]");
    process.exit(sub ? 1 : 0);
  }
} catch (e) {
  console.error("✖ " + e.message);
  process.exit(1);
}
