/**
 * Maakt de deelbare afbeeldingen van de instructiekaart (1080×1920, nl en en) door
 * /afval/instructie/afbeelding te openen in headless Chrome en alleen #deelkaart te fotograferen.
 * Draai eerst de site (bun run dev of start), daarna:
 *
 *   bun run afval:deelkaart [basis-url]      (standaard http://localhost:3000)
 *
 * Chrome-pad aanpassen kan met CHROME=/pad/naar/chrome.
 */
import { spawn } from 'child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const BASE = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '');
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9400 + Math.floor(Math.random() * 400);
const OUT = new URL('../public/afval/', import.meta.url);
const TARGETS = [
  { locale: 'nl', path: '/afval/instructie/afbeelding' },
  { locale: 'en', path: '/en/afval/instructie/afbeelding' },
];

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
    await mkdir(OUT, { recursive: true });

    for (const { locale, path } of TARGETS) {
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
      const file = new URL(`instructiekaart-${locale}.png`, OUT);
      await writeFile(file, Buffer.from(shot.data, 'base64'));
      console.log(`${locale}: ${Math.round(clip.width)}×${Math.round(clip.height)} → public/afval/instructiekaart-${locale}.png`);
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
