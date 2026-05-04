#!/usr/bin/env node
/**
 * 로컬 .env 의 OPENAI_API_KEY(또는 VITE_OPENAI_API_KEY)를
 * 현재 프로젝트에 연결된 Vercel 환경(Production / Preview / Development)에 등록합니다.
 *
 * 조건:
 * - 프로젝트 루트에서 `vercel link` 로 이미 연결되어 있거나, CLI 로 로그인된 상태
 * - 루트에 .env 가 있고 키가 설정되어 있을 것
 *
 * 사용법: node scripts/vercel-push-openai-key.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const envPath = join(root, ".env");

function extractKey(contents) {
  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m =
      trimmed.match(/^OPENAI_API_KEY\s*=\s*(.*)$/) ??
      trimmed.match(/^VITE_OPENAI_API_KEY\s*=\s*(.*)$/);
    if (m) {
      let v = m[1].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      return v || null;
    }
  }
  return null;
}

if (!existsSync(envPath)) {
  console.error("파일 없음:", envPath);
  process.exit(1);
}

const key = extractKey(readFileSync(envPath, "utf8"));
if (!key) {
  console.error(".env 에 OPENAI_API_KEY 또는 VITE_OPENAI_API_KEY 가 없습니다.");
  process.exit(1);
}

const environments = ["production", "preview", "development"];

for (const env of environments) {
  const r = spawnSync(
    "npx",
    [
      "vercel",
      "env",
      "add",
      "OPENAI_API_KEY",
      env,
      "--value",
      key,
      "-y",
      "--force",
    ],
    { cwd: root, stdio: "inherit", env: process.env },
  );
  if (r.status !== 0) {
    console.error(`${env}: 등록 실패 (exit ${r.status})`);
    process.exit(r.status ?? 1);
  }
}

console.log("OPENAI_API_KEY 를 production / preview / development 에 등록했습니다.");
