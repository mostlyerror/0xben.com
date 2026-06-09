#!/usr/bin/env node
// `next dev`, but find the first open port from 3000 up instead of failing when
// 3000 is already taken. Honors PORT as the starting point. Keeps the default
// (3000 when it's free) — only steps up when it has to.

import { createServer } from "node:net";
import { spawn } from "node:child_process";

const start = Number(process.env.PORT) || 3000;
const MAX = start + 50;

const isFree = (port) =>
  new Promise((resolve) => {
    const srv = createServer();
    srv.once("error", () => resolve(false));
    srv.once("listening", () => srv.close(() => resolve(true)));
    srv.listen(port, "0.0.0.0");
  });

let port = start;
while (port < MAX && !(await isFree(port))) port++;
if (port >= MAX) {
  console.error(`✖ No open port in ${start}–${MAX - 1}.`);
  process.exit(1);
}
if (port !== start) console.log(`⚠️  port ${start} is taken — using ${port}`);

// `next` resolves via node_modules/.bin (npm/pnpm put it on PATH for run-scripts).
const child = spawn("next", ["dev", "-p", String(port)], { stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 0));
