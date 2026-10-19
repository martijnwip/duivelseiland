/**
 * Maakt de deelbare afbeeldingen van de instructiekaarten (1080×1920, nl en en) door
 * /<kaart>/instructie/afbeelding te openen in headless Chrome en alleen #deelkaart te fotograferen.
 * Draai eerst de site (bun run dev of start), daarna:
 *
 *   bun run afval:deelkaart [basis-url]      (standaard http://localhost:3000)
 *   bun run geluid:deelkaart [basis-url]
 *
 * Zonder KAART maakt hij ze allebei. Chrome-pad aanpassen kan met CHROME=/pad/naar/chrome;
 * anders zoekt hij Chromium of Chrome op de gebruikelijke plekken (Linux en macOS).
 */
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { mkdtemp, mkdir, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const BASE = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '');
const CHROME =
  process.env.CHROME ??
  ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find((p) => existsSync(p)) ??
  'chromium';
const PORT = 9400 + Math.floor(Math.random() * 400);
const KAARTEN = (process.env.KAART ? [process.env.KAART] : ['afval', 'geluid']) as string[];
const TARGETS = KAARTEN.flatMap((kaart) => [
  { kaart, locale: 'nl', path: `/${kaart}/instructie/afbeelding` },
  { kaart, locale: 'en', path: `/en/${kaart}/instructie/afbeelding` },
]);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Cdp = (method: string, params?: Record<string, unknown>) => Promise<any>;

async function connect(): Promise<{ send: Cdp; once: (event: string) => Promise<void>; close: () => void }> {
  let targets: { type: string; webSocketDebuggerUrl: string }[] = [];
  for (let i = 0; i < 50 && !targets.length; i++) {
    await sleep(200);
    targets = await fetch(`http://127.0.0.1:${PORT}/json`)
      .then((r) => r.json())
      .catch(() => []);
  }
  const page = targets.find((t) => t.type === 'page');
  if (!page) throw new Error('Geen Chrome-tabblad gevonden');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map<number, (v: any) => void>();
  const waiters = new Map<string, () => void>();
  ws.onmessage = (e) => {
    const m = JSON.parse(String(e.data));
    if (m.id && pending.has(m.id)) {
      if (m.error) console.error(m.error);
      pending.get(m.id)!(m.result);
      pending.delete(m.id);
    } else if (m.method && waiters.has(m.method)) {
      waiters.get(m.method)!();
      waiters.delete(m.method);
    }
  };
  const send: Cdp = (method, params = {}) =>
    new Promise((resolve) => {
      const i = ++id;
      pending.set(i, resolve);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  const once = (event: string) => new Promise<void>((resolve) => waiters.set(event, resolve));
  return { send, once, close: () => ws.close() };
}

async function run() {
  const profile = await mkdtemp(join(tmpdir(), 'deelkaart-'));
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${profile}`, 'about:blank'], {
    stdio: 'ignore',
  });
  try {
    const { send, once, close } = await connect();
    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 2200, deviceScaleFactor: 1, mobile: false });
    // Altijd de lichte variant van de site eromheen; de kaart zelf is sowieso licht.
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
    for (const { kaart, locale, path } of TARGETS) {
      const out = new URL(`../public/${kaart}/`, import.meta.url);
      await mkdir(out, { recursive: true });
      const loaded = once('Page.loadEventFired');
      await send('Page.navigate', { url: `${BASE}${path}` });
      await loaded;
      const { result } = await send('Runtime.evaluate', {
        expression: `(async () => {
          await document.fonts.ready;
          await Promise.all([...document.images].map((i) => i.complete ? 0 : new Promise((r) => (i.onload = i.onerror = r))));
          // De sticky site-header zou over de kaart heen vallen. Verbergen via CSS (niet uit de DOM
          // halen: React zet hem na hydratatie terug en dan verschuift de kaart).
          const style = document.createElement('style');
          style.textContent = 'body > header, body > footer { display: none !important; }';
          document.head.append(style);
          await new Promise((r) => setTimeout(r, 500));
          window.scrollTo(0, 0);
          const el = document.getElementById('deelkaart');
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return JSON.stringify({ x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height });
        })()`,
        awaitPromise: true,
        returnByValue: true,
      });
      if (!result?.value) throw new Error(`#deelkaart niet gevonden op ${path}`);
      const clip = JSON.parse(result.value);
      const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...clip, scale: 1 } });
      const file = new URL(`instructiekaart-${locale}.png`, out);
      await writeFile(file, Buffer.from(shot.data, 'base64'));
      console.log(`${kaart} ${locale}: ${Math.round(clip.width)}×${Math.round(clip.height)} → public/${kaart}/instructiekaart-${locale}.png`);
    }
    close();
  } finally {
    chrome.kill();
    await rm(profile, { recursive: true, force: true });
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
