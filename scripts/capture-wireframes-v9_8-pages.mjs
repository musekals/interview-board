import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.join(projectRoot, "artifacts", "wireframes_v9_8_pages");
const exportBaseUrl = "http://127.0.0.1:3000/wireframes/v9_8/export";
const safariDriverUrl = "http://127.0.0.1:4444";

const screens = [
  { id: "feed", file: "01-feed-home" },
  { id: "issues", file: "02-issues-list" },
  { id: "rooms", file: "03-rooms-list" },
  { id: "room", file: "04-room-detail" },
  { id: "issue", file: "05-issue-detail" },
  { id: "mypage", file: "06-mypage" },
  { id: "profile", file: "07-profile" },
  { id: "profile-edit", file: "08-profile-edit" },
  { id: "invite-landing", file: "09-invite-landing" },
  { id: "aspect-add", file: "10-aspect-add" },
  { id: "join-aspect", file: "11-join-aspect" },
  { id: "room-settings", file: "12-room-settings" },
  { id: "issue-publish", file: "13-issue-publish" },
  { id: "rep-comment", file: "14-rep-comment" },
  { id: "operator-sign-off", file: "15-operator-sign-off" },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForEndpoint(url, attempts = 40) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, { method: "GET" });
      if (response.ok || response.status === 404) return;
    } catch {
      // Keep polling until the service comes up.
    }

    await sleep(500);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function webdriver(method, pathname, body) {
  const response = await fetch(`${safariDriverUrl}${pathname}`, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(
      `WebDriver ${method} ${pathname} failed: ${JSON.stringify(json)}`,
    );
  }

  return json.value;
}

async function waitForExportScreen(sessionId) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const ready = await webdriver("POST", `/session/${sessionId}/execute/sync`, {
      script: `
        return document.readyState === "complete" &&
          !!document.getElementById("wireframe-capture-phone");
      `,
      args: [],
    });

    if (ready) return;
    await sleep(200);
  }

  throw new Error("Timed out waiting for export screen to render");
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  await waitForEndpoint(`${exportBaseUrl}?screen=feed&state=0`);
  await waitForEndpoint(`${safariDriverUrl}/status`);

  const session = await webdriver("POST", "/session", {
    capabilities: {
      alwaysMatch: {
        browserName: "safari",
      },
    },
  });

  const sessionId = session.sessionId;
  if (!sessionId) {
    throw new Error(`Missing sessionId in response: ${JSON.stringify(session)}`);
  }

  try {
    await webdriver("POST", `/session/${sessionId}/window/rect`, {
      width: 520,
      height: 1200,
      x: 40,
      y: 40,
    });

    for (const screen of screens) {
      const url = `${exportBaseUrl}?screen=${encodeURIComponent(screen.id)}&state=0`;
      const filePath = path.join(outputDir, `${screen.file}.png`);

      await webdriver("POST", `/session/${sessionId}/url`, { url });
      await waitForExportScreen(sessionId);
      await sleep(250);

      const metrics = await webdriver(
        "POST",
        `/session/${sessionId}/execute/sync`,
        {
          script: `
            const phone = document.getElementById("wireframe-capture-phone");
            return {
              phoneHeight: phone?.getBoundingClientRect().height ?? 0,
              innerHeight: window.innerHeight,
              outerHeight: window.outerHeight,
            };
          `,
          args: [],
        },
      );

      const browserChromeHeight = metrics.outerHeight - metrics.innerHeight;
      const requiredOuterHeight = Math.ceil(
        metrics.phoneHeight + browserChromeHeight + 40,
      );

      await webdriver("POST", `/session/${sessionId}/window/rect`, {
        width: 520,
        height: requiredOuterHeight,
        x: 40,
        y: 40,
      });
      await sleep(300);

      const element = await webdriver("POST", `/session/${sessionId}/element`, {
        using: "css selector",
        value: "#wireframe-capture-phone",
      });
      const elementKey = Object.keys(element).find((key) =>
        key.includes("element"),
      );
      if (!elementKey) {
        throw new Error(`Missing element key in response: ${JSON.stringify(element)}`);
      }

      const screenshotBase64 = await webdriver(
        "GET",
        `/session/${sessionId}/element/${element[elementKey]}/screenshot`,
      );

      await fs.writeFile(filePath, Buffer.from(screenshotBase64, "base64"));
      process.stdout.write(`Saved ${filePath}\n`);
    }
  } finally {
    try {
      await webdriver("DELETE", `/session/${sessionId}`);
    } catch {
      // Ignore cleanup errors.
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
