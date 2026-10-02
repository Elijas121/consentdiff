import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import type { Frame, Page } from "playwright";

/**
 * Second engine: DuckDuckGo's autoconsent (MPL-2.0), a maintained rule set for several hundred consent
 * tools. consentdiff asks it only when its own search found no control. It can also reject through a
 * settings layer, which the report keeps apart from a reject control on the first layer.
 */

const require = createRequire(import.meta.url);
let script: string | undefined;
let rules: string | undefined;

function load(): { script: string; rules: string } {
  if (!script || !rules) {
    const rulesPath = require.resolve("@duckduckgo/autoconsent/rules/rules.json");
    script = readFileSync(rulesPath.replace(/rules[\\/]rules\.json$/, "dist/autoconsent.playwright.js"), "utf8");
    rules = readFileSync(rulesPath, "utf8");
  }
  return { script, rules };
}

export interface AutoconsentRun {
  /** Name of the consent tool whose popup autoconsent found, if any. */
  cmp?: string;
  /** The action succeeded according to autoconsent's rule. */
  done: boolean;
  /** Pages or frames autoconsent navigated away from the scanned site: the result is not usable. */
  navigatedAway?: boolean;
}

interface Message {
  type: string;
  cmp?: string;
  result?: boolean;
  id?: string;
  code?: string;
}

/**
 * Detect the popup and, for "optOut" or "optIn", answer it. Resolves after the action finished, or
 * after `waitMs` without a popup. Never throws; a failure is `done: false`.
 */
export async function runAutoconsent(page: Page, action: "optOut" | "optIn" | null, waitMs: number, customRules?: string): Promise<AutoconsentRun> {
  const bundled = load();
  const content = bundled.script;
  const ruleJson = customRules ?? bundled.rules;
  const out: AutoconsentRun = { done: false };
  let finished = false;
  const startHost = new URL(page.url()).hostname;
  const config = {
    enabled: true,
    autoAction: action,
    disabledCmps: [],
    enablePrehide: false,
    enableCosmeticRules: false,
    enableGeneratedRules: true,
    enableHeuristicDetection: true,
    detectRetries: 20,
    visualTest: false,
    logs: {},
  };
  const reply = (frame: Frame, js: string) => frame.evaluate(js).catch(() => undefined);
  try {
    await page.exposeBinding("autoconsentSendMessage", async ({ frame }: { frame: Frame }, msg: Message) => {
      switch (msg.type) {
        case "init":
          await reply(frame, `autoconsentReceiveMessage({ type: "initResp", config: ${JSON.stringify(config)}, rules: ${ruleJson} })`);
          break;
        case "popupFound":
          out.cmp ??= msg.cmp;
          if (!action) finished = true;
          break;
        case "optOutResult":
        case "optInResult":
          out.cmp ??= msg.cmp;
          out.done = msg.result === true;
          break;
        case "autoconsentDone":
          out.cmp ??= msg.cmp;
          finished = true;
          break;
        case "eval": {
          const result = await frame.evaluate(msg.code ?? "false").catch(() => false);
          await reply(frame, `autoconsentReceiveMessage({ id: ${JSON.stringify(msg.id)}, type: "evalResp", result: ${JSON.stringify(result)} })`);
          break;
        }
      }
    });
  } catch {
    return out; // binding already exposed on this page
  }
  const inject = (frame: Frame) => frame.evaluate(content).catch(() => undefined);
  await Promise.all(page.frames().map(inject));
  page.on("framenavigated", (frame) => void inject(frame));
  const deadline = Date.now() + waitMs;
  // An action may take several clicks through a settings layer; give it time once a popup is found.
  while (!finished && Date.now() < deadline + (out.cmp && action ? 10000 : 0)) {
    if (page.isClosed()) return out;
    await page.waitForTimeout(250);
  }
  try {
    if (new URL(page.url()).hostname !== startHost) out.navigatedAway = true;
  } catch {
    out.navigatedAway = true;
  }
  if (!finished) out.done = false;
  return out;
}
