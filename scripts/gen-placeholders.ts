/**
 * تولید پلیس‌هولدرهای SVG — «بسلامت»
 * ────────────────────────────────
 * اجرا:   bun scripts/gen-placeholders.ts   (اسکریپت npm: assets:generate)
 * خروجی:  public/placeholders/*.svg
 *
 * ⚠️ SVGها به‌عنوان <img> لود می‌شوند و فونت اجرا نمی‌شود → هیچ متنی در فایل‌ها نیست.
 * بدون وابستگی خارجی (فقط node:fs). همهٔ رنگ‌ها از توکن‌های برند (globals.css).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/* ── پالت برند ── */
const PINE = "#0C3B2E"; // سبز کاجی
const PINE_LIGHT = "#14532D"; // سبز روشن‌تر (متالیک)
const GOLD = "#C9A24B"; // طلایی
const IVORY = "#F7F6F1"; // عاجی
const MIST = "#E9F3EC"; // سبز خیلی روشن

const OUT_DIR = join(process.cwd(), "public", "placeholders");

/* ── ابزار عددی: گردکردن تا ۲ رقم ── */
const n = (v: number): string => String(Math.round(v * 100) / 100);

/* ── سازندهٔ سند SVG ── */
function svgDoc(w: number, h: number, defs: string, body: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="geometricPrecision">` +
    `<defs>${defs}</defs>${body}</svg>`
  );
}

/* ── گرادیان خطی با زاویه (۰° = چپ→راست) ── */
function lg(id: string, from: string, to: string, angle: number): string {
  const r = (angle * Math.PI) / 180;
  const c = Math.cos(r) / 2;
  const s = Math.sin(r) / 2;
  return (
    `<linearGradient id="${id}" x1="${n(0.5 - c)}" y1="${n(0.5 - s)}" x2="${n(0.5 + c)}" y2="${n(0.5 + s)}">` +
    `<stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/></linearGradient>`
  );
}

/* ── پترن کاشی‌شوندهٔ ستارهٔ هشت‌پر (دو مربع، یکی ۴۵° چرخیده) ── */
function starPattern(id: string, cell: number, side: number, sw: number, opacity: number): string {
  const c = cell / 2;
  const h = side / 2;
  return (
    `<pattern id="${id}" width="${n(cell)}" height="${n(cell)}" patternUnits="userSpaceOnUse">` +
    `<g fill="none" stroke="${GOLD}" stroke-width="${n(sw)}" opacity="${opacity}" stroke-linejoin="round">` +
    `<rect x="${n(c - h)}" y="${n(c - h)}" width="${n(side)}" height="${n(side)}"/>` +
    `<rect x="${n(c - h)}" y="${n(c - h)}" width="${n(side)}" height="${n(side)}" transform="rotate(45 ${n(c)} ${n(c)})"/>` +
    `</g></pattern>`
  );
}

/* ── هالهٔ نور طلایی (گرادیان شعاعی) ── */
function glowDef(id: string): string {
  return (
    `<radialGradient id="${id}">` +
    `<stop offset="0%" stop-color="${GOLD}" stop-opacity="0.14"/>` +
    `<stop offset="55%" stop-color="${GOLD}" stop-opacity="0.05"/>` +
    `<stop offset="100%" stop-color="${GOLD}" stop-opacity="0"/>` +
    `</radialGradient>`
  );
}

/* ── حلقهٔ طلایی ── */
function goldRing(cx: number, cy: number, r: number, sw: number, opacity: number): string {
  return `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="none" stroke="${GOLD}" stroke-width="${n(sw)}" opacity="${opacity}"/>`;
}

function glowCircle(id: string, cx: number, cy: number, r: number): string {
  return `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="url(#${id})"/>`;
}

/* ── لوزی طلایی ── */
function diamond(cx: number, cy: number, s: number, opacity: number): string {
  return (
    `<path d="M ${n(cx)} ${n(cy - s)} L ${n(cx + s)} ${n(cy)} L ${n(cx)} ${n(cy + s)} L ${n(cx - s)} ${n(cy)} Z"` +
    ` fill="${GOLD}" opacity="${opacity}"/>`
  );
}

/* ── جای‌گذاری گلیف با مقیاس/چرخش؛ ضخامت خطی ثابت ── */
function place(
  inner: string,
  cx: number,
  cy: number,
  scale: number,
  rot: number,
  stroke: string,
  swVisual: number,
  opacity = 1,
): string {
  return (
    `<g transform="translate(${n(cx)} ${n(cy)}) rotate(${n(rot)}) scale(${n(scale)})" fill="none"` +
    ` stroke="${stroke}" stroke-width="${n(swVisual / scale)}" stroke-linecap="round" stroke-linejoin="round"` +
    ` opacity="${opacity}">${inner}</g>`
  );
}

/* ══════════ گلیف‌های خطی مینیمال (۹ گلیف، مختصات محلی ±۱۰۰) ══════════ */
type GlyphKey =
  | "bp"
  | "glucose"
  | "thermometer"
  | "respiratory"
  | "wheelchair"
  | "bed"
  | "orthopedic"
  | "mask"
  | "scale";

const WAVE_D =
  "M -92 0 C -84 -22 -72 -22 -64 0 C -56 22 -44 22 -36 0 C -28 -22 -16 -22 -8 0" +
  " C 0 22 12 22 20 0 C 28 -22 40 -22 48 0 C 56 22 68 22 76 0 C 84 -22 92 -22 96 -8";

const GLYPHS: Record<GlyphKey, string> = {
  /* فشارسنج: مانیتور گردگوشه + لوله + کاف بیضی + خط نمایشگر */
  bp: `<rect x="-95" y="-70" width="105" height="100" rx="16"/>` +
    `<path d="M 10 -5 C 45 -5 40 30 72 40"/>` +
    `<ellipse cx="72" cy="48" rx="26" ry="17" transform="rotate(-20 72 48)"/>` +
    `<path d="M -75 -40 H -25"/>`,
  /* قند: قطره */
  glucose: `<path d="M 0 -92 C 26 -50 52 -22 52 18 C 52 60 29 92 0 92 C -29 92 -52 60 -52 18 C -52 -22 -26 -50 0 -92 Z"/>`,
  /* دماسنج: کپسول عمودی + حباب + درجه‌ها */
  thermometer: `<rect x="-24" y="-95" width="48" height="128" rx="24"/>` +
    `<circle cx="0" cy="50" r="30"/>` +
    `<path d="M 38 -60 H 50"/><path d="M 38 -30 H 50"/><path d="M 38 0 H 50"/>`,
  /* تنفسی: سه خط جریان موجی */
  respiratory: `<path d="${WAVE_D}" transform="translate(0 -46)"/>` +
    `<path d="${WAVE_D}"/>` +
    `<path d="${WAVE_D}" transform="translate(12 46)"/>`,
  /* ویلچر: دو دایره + شاسی */
  wheelchair: `<path d="M -88 -92 V -20"/>` +
    `<path d="M -88 -20 H 20"/>` +
    `<path d="M 20 -20 V 48"/>` +
    `<circle cx="-12" cy="26" r="62"/>` +
    `<circle cx="66" cy="62" r="13"/>`,
  /* تخت: مستطیل گرد + بالش + پایه‌ها + تاج‌سر تخت */
  bed: `<rect x="-96" y="-34" width="168" height="52" rx="18"/>` +
    `<rect x="-84" y="-24" width="30" height="18" rx="9"/>` +
    `<path d="M -78 18 V 66"/><path d="M 54 18 V 66"/>` +
    `<path d="M -96 -34 V -78"/>`,
  /* ارتوپدی: منحنی S ستون + تیک‌های کوتاه */
  orthopedic: `<path d="M 0 -95 C 30 -62 -30 -28 0 5 C 30 38 -30 72 0 95"/>` +
    `<path d="M -16 -58 H 16"/><path d="M -16 -22 H 16"/><path d="M -16 14 H 16"/><path d="M -16 50 H 16"/>`,
  /* ماسک: بیضی + خط میانی + دو حلقه گوشی */
  mask: `<ellipse cx="0" cy="0" rx="64" ry="46"/>` +
    `<path d="M 0 -44 V 44"/>` +
    `<path d="M -60 -18 C -92 -34 -88 -62 -64 -70"/>` +
    `<path d="M 60 -18 C 92 -34 88 -62 64 -70"/>`,
  /* ترازو: مربع گرد + قوس نمایشگر */
  scale: `<rect x="-78" y="-78" width="156" height="156" rx="26"/>` +
    `<path d="M -34 -20 A 40 40 0 0 1 34 -20"/>`,
};

/* نگاشت شمارهٔ محصول → گلیف دستهٔ والد */
const PRODUCT_GLYPHS: GlyphKey[] = [
  "bp", "bp", // 1: اومرون M2 — 2: بویرون BM19
  "glucose", "glucose", // 3: راسمکس TG300 — 4: نوار بویرون
  "thermometer", "thermometer", // 5: بویرون FT90 — 6: اومرون MC245
  "respiratory", "respiratory", "respiratory", // 7: پالس اکسیمتر — 8: بخور — 9: اسپایرومتر
  "wheelchair", // 10: ویلچر تاشار
  "bed", // 11: تخت برقی
  "orthopedic", // 12: کمربند طبی
  "mask", // 13: ماسک جراحی
  "scale", "scale", // 14: ترازوی دیجیتال — 15: آنالیزاتور بدن
];

/* ══════════ شاخهٔ سرو خطی (برای اسلایدها) ══════════ */
function cedarBranch(x: number, baseY: number, h: number, lean: number, sw: number, opacity: number): string {
  const p0x = x;
  const p0y = baseY;
  const p1x = x + lean * 0.25;
  const p1y = baseY - h * 0.55;
  const p2x = x + lean;
  const p2y = baseY - h;
  let out = `<path d="M ${n(p0x)} ${n(p0y)} Q ${n(p1x)} ${n(p1y)} ${n(p2x)} ${n(p2y)}"/>`;
  const ts = [0.2, 0.36, 0.52, 0.68, 0.82, 0.93];
  ts.forEach((t, i) => {
    const mt = 1 - t;
    const px = mt * mt * p0x + 2 * mt * t * p1x + t * t * p2x;
    const py = mt * mt * p0y + 2 * mt * t * p1y + t * t * p2y;
    const len = 36 - i * 5;
    const side = i % 2 === 0 ? 1 : -1;
    out += `<path d="M ${n(px)} ${n(py)} l ${n(side * len)} ${n(len * 0.55)}"/>`;
  });
  return `<g fill="none" stroke="${GOLD}" stroke-width="${n(sw)}" stroke-linecap="round" opacity="${opacity}">${out}</g>`;
}

/* ══════════ درخت سرو مینیمال (برای OG) ══════════ */
function cedarTree(cx: number, baseY: number, h: number, sw: number, opacity: number): string {
  let out = `<path d="M ${n(cx)} ${n(baseY)} V ${n(baseY - h)}"/>`;
  const fr = [0.2, 0.38, 0.54, 0.68, 0.8];
  fr.forEach((f, i) => {
    const y = baseY - h * f;
    const L = h * (0.34 - i * 0.055);
    const droop = L * 0.45;
    out += `<path d="M ${n(cx)} ${n(y)} L ${n(cx - L)} ${n(y + droop)}"/>`;
    out += `<path d="M ${n(cx)} ${n(y)} L ${n(cx + L)} ${n(y + droop)}"/>`;
  });
  return `<g fill="none" stroke="${GOLD}" stroke-width="${n(sw)}" stroke-linecap="round" opacity="${opacity}">${out}</g>`;
}

/* ══════════ تصویر محصول ۸۰۰×۸۰۰ — نسخهٔ a و b ══════════ */
function productSvg(glyph: GlyphKey, variant: "a" | "b"): string {
  const isA = variant === "a";
  const defs = lg("bg", IVORY, MIST, isA ? 135 : 315) + starPattern("stars", 112, 17, 1.1, 0.03);
  const ring = isA ? goldRing(400, 400, 250, 2, 0.5) : goldRing(400, 400, 258, 1.5, 0.42);
  const g = isA
    ? place(GLYPHS[glyph], 400, 401, 1.55, -3, PINE, 3)
    : place(GLYPHS[glyph], 397, 396, 1.5, 5, PINE, 3);
  const corner = isA ? diamond(72, 728, 15, 0.9) : diamond(728, 72, 13, 0.85);
  const body =
    `<rect width="800" height="800" fill="url(#bg)"/>` +
    `<rect width="800" height="800" fill="url(#stars)"/>` +
    ring + g + corner;
  return svgDoc(800, 800, defs, body);
}

/* ══════════ اسلاید ۱۶۰۰×۷۲۰ — سه ترکیب‌بندی، فضای متنِ سمت راست خالی ══════════ */
function slideSvg(num: 1 | 2 | 3): string {
  const angle = num === 1 ? 120 : num === 2 ? 160 : 200;
  const defs =
    lg("bg", PINE, PINE_LIGHT, angle) +
    starPattern("stars", 128, 19, 1.2, 0.05) +
    glowDef("glow");

  let art = "";
  if (num === 1) {
    art =
      glowCircle("glow", 430, 400, 520) +
      goldRing(430, 400, 310, 2, 0.16) +
      goldRing(430, 400, 232, 1.5, 0.1) +
      cedarBranch(310, 620, 330, -55, 2, 0.5) +
      `<path d="M 120 640 H 560" stroke="${GOLD}" stroke-width="1" opacity="0.25"/>` +
      diamond(588, 640, 9, 0.8);
  } else if (num === 2) {
    art =
      glowCircle("glow", 340, 330, 560) +
      goldRing(150, 40, 420, 2.5, 0.18) +
      goldRing(520, 430, 250, 2, 0.2) +
      goldRing(520, 430, 180, 1.5, 0.12) +
      cedarBranch(600, 660, 260, 70, 2, 0.45) +
      diamond(170, 620, 12, 0.8);
  } else {
    art =
      glowCircle("glow", 400, 360, 560) +
      goldRing(400, 360, 330, 2, 0.12) +
      goldRing(400, 360, 250, 2, 0.18) +
      goldRing(400, 360, 170, 1.5, 0.26) +
      cedarBranch(215, 665, 380, -70, 2, 0.5) +
      `<path d="M 140 560 H 520" stroke="${GOLD}" stroke-width="1" opacity="0.2"/>` +
      diamond(150, 130, 11, 0.8) +
      diamond(250, 470, 8, 0.6) +
      diamond(640, 110, 9, 0.7);
  }
  const body =
    `<rect width="1600" height="720" fill="url(#bg)"/>` +
    `<rect width="1600" height="720" fill="url(#stars)"/>` +
    art;
  return svgDoc(1600, 720, defs, body);
}

/* ══════════ بنر ۹۶۰×۴۰۰ — تناژ روشن + گلیف دسته ══════════ */
function bannerSvg(glyph: GlyphKey, num: 1 | 2): string {
  const first = num === 1;
  const defs = lg("bg", IVORY, MIST, first ? 120 : 240) + starPattern("stars", 96, 15, 1, 0.035);
  const ring = goldRing(208, 208, first ? 130 : 138, 1.75, first ? 0.45 : 0.38);
  const g = place(GLYPHS[glyph], 208, 208, 0.8, first ? -4 : 4, PINE, 3);
  const accents = first
    ? `<path d="M 620 96 V 304" stroke="${GOLD}" stroke-width="1" opacity="0.25"/>` + diamond(872, 336, 12, 0.85)
    : `<path d="M 320 336 H 640" stroke="${GOLD}" stroke-width="1" opacity="0.22"/>` + diamond(88, 64, 11, 0.8);
  const body =
    `<rect width="960" height="400" fill="url(#bg)"/>` +
    `<rect width="960" height="400" fill="url(#stars)"/>` +
    ring + g + accents;
  return svgDoc(960, 400, defs, body);
}

/* ══════════ تصویر مقاله ۱۲۰۰×۸۰۰ — گلیف بزرگ کم‌رنگ ══════════ */
function articleSvg(glyph: GlyphKey, num: 1 | 2 | 3): string {
  const angle = num === 1 ? 135 : num === 2 ? 100 : 240;
  const rot = num === 1 ? -5 : num === 2 ? 4 : -3;
  const defs = lg("bg", IVORY, MIST, angle) + starPattern("stars", 120, 18, 1.1, 0.03);
  const body =
    `<rect width="1200" height="800" fill="url(#bg)"/>` +
    `<rect width="1200" height="800" fill="url(#stars)"/>` +
    goldRing(600, 400, 300, 1.5, 0.3) +
    place(GLYPHS[glyph], 600, 400, 2.35, rot, PINE, 2.6, 0.13) +
    diamond(96, 96, 14, 0.9) +
    diamond(1104, 704, 9, 0.6);
  return svgDoc(1200, 800, defs, body);
}

/* ══════════ OG پیش‌فرض ۱۲۰۰×۶۳۰ — متالیک + حلقه + درخت سرو ══════════ */
function ogSvg(): string {
  const defs =
    lg("bg", PINE, PINE_LIGHT, 135) +
    starPattern("stars", 128, 19, 1.2, 0.05) +
    glowDef("glow");
  const body =
    `<rect width="1200" height="630" fill="url(#bg)"/>` +
    `<rect width="1200" height="630" fill="url(#stars)"/>` +
    glowCircle("glow", 600, 315, 520) +
    goldRing(600, 315, 300, 1.5, 0.16) +
    goldRing(600, 315, 235, 2.5, 0.6) +
    cedarTree(600, 480, 310, 2.2, 0.8) +
    diamond(170, 120, 12, 0.8) +
    diamond(1030, 520, 10, 0.7);
  return svgDoc(1200, 630, defs, body);
}

/* ══════════ اجرا ══════════ */
mkdirSync(OUT_DIR, { recursive: true });

const files: Array<[string, string]> = [];
PRODUCT_GLYPHS.forEach((g, i) => {
  files.push([`product-${i + 1}-a.svg`, productSvg(g, "a")]);
  files.push([`product-${i + 1}-b.svg`, productSvg(g, "b")]);
});
files.push(["slide-1.svg", slideSvg(1)], ["slide-2.svg", slideSvg(2)], ["slide-3.svg", slideSvg(3)]);
files.push(["banner-1.svg", bannerSvg("mask", 1)], ["banner-2.svg", bannerSvg("orthopedic", 2)]);
files.push(
  ["article-1.svg", articleSvg("bp", 1)],
  ["article-2.svg", articleSvg("glucose", 2)],
  ["article-3.svg", articleSvg("thermometer", 3)],
);
files.push(["og-default.svg", ogSvg()]);

for (const [name, svg] of files) {
  writeFileSync(join(OUT_DIR, name), svg + "\n", "utf8");
}
console.log(`✅ ${files.length} فایل SVG در public/placeholders ساخته شد.`);
