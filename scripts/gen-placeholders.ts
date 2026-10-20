/**
 * تولید پلیس‌هولدرهای SVG — «بسلامت» (پالت ۲۰۲۶: سبز + سفید)
 * ────────────────────────────────
 * اجرا:   bun scripts/gen-placeholders.ts   (اسکریپت npm: assets:generate)
 * خروجی:  public/placeholders/*.svg
 *
 * ⚠️ SVGها به‌عنوان <img> لود می‌شوند و فونت اجرا نمی‌شود → هیچ متنی در فایل‌ها نیست.
 * بدون وابستگی خارجی (فقط node:fs). همهٔ رنگ‌ها از توکن‌های برند (globals.css).
 * زبان بصری: حلقه‌های نرم، قوس‌ها، نقطه‌ها — بدون پترن مشبک.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/* ── پالت برند ۲۰۲۶ ── */
const PINE = "#0B4634"; // سبز عمیق
const PINE_LIGHT = "#0F5C43"; // سبز روشن‌تر (گرادیان عمیق)
const FRESH = "#1E9E6A"; // سبز تازه — اکسنت
const FRESH_SOFT = "#8FD4B3"; // سبز روشن ملایم — روی سطوح تیره
const IVORY = "#F8FBF9"; // سفید سبزفام
const MIST = "#E7F2EB"; // مه سبز خیلی روشن

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

/* ── هالهٔ نور سبز (گرادیان شعاعی) ── */
function glowDef(id: string, color = FRESH): string {
  return (
    `<radialGradient id="${id}">` +
    `<stop offset="0%" stop-color="${color}" stop-opacity="0.16"/>` +
    `<stop offset="55%" stop-color="${color}" stop-opacity="0.06"/>` +
    `<stop offset="100%" stop-color="${color}" stop-opacity="0"/>` +
    `</radialGradient>`
  );
}

/* ── حلقهٔ سبز ── */
function ring(cx: number, cy: number, r: number, sw: number, opacity: number, color = FRESH): string {
  return `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="none" stroke="${color}" stroke-width="${n(sw)}" opacity="${opacity}"/>`;
}

function glowCircle(id: string, cx: number, cy: number, r: number): string {
  return `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="url(#${id})"/>`;
}

/* ── نقطهٔ توپر ── */
function dot(cx: number, cy: number, r: number, opacity: number, color = FRESH): string {
  return `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${color}" opacity="${opacity}"/>`;
}

/* ── علامت بعلاوهٔ ظریف ── */
function plus(cx: number, cy: number, s: number, sw: number, opacity: number, color = FRESH): string {
  return (
    `<path d="M ${n(cx - s)} ${n(cy)} H ${n(cx + s)} M ${n(cx)} ${n(cy - s)} V ${n(cx === cx ? cy + s : cy + s)}" ` +
    `stroke="${color}" stroke-width="${n(sw)}" stroke-linecap="round" opacity="${opacity}"/>`
  );
}

/* ── قوس نرم ── */
function arc(cx: number, cy: number, r: number, a0: number, a1: number, sw: number, opacity: number, color = FRESH): string {
  const p = (a: number) => `${n(cx + r * Math.cos((a * Math.PI) / 180))} ${n(cy + r * Math.sin((a * Math.PI) / 180))}`;
  return (
    `<path d="M ${p(a0)} A ${n(r)} ${n(r)} 0 0 1 ${p(a1)}" fill="none" stroke="${color}" ` +
    `stroke-width="${n(sw)}" stroke-linecap="round" opacity="${opacity}"/>`
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

/* ══════════ گلیف‌های خطی مینیمال (مختصات محلی ±۱۰۰) ══════════ */
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
  return `<g fill="none" stroke="${FRESH_SOFT}" stroke-width="${n(sw)}" stroke-linecap="round" opacity="${opacity}">${out}</g>`;
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
  return `<g fill="none" stroke="${FRESH_SOFT}" stroke-width="${n(sw)}" stroke-linecap="round" opacity="${opacity}">${out}</g>`;
}

/* ══════════ تصویر محصول ۸۰۰×۸۰۰ — نسخهٔ a و b ══════════ */
function productSvg(glyph: GlyphKey, variant: "a" | "b"): string {
  const isA = variant === "a";
  const defs = lg("bg", IVORY, MIST, isA ? 135 : 315);
  const r = isA ? ring(400, 400, 250, 2, 0.4) : ring(400, 400, 258, 1.5, 0.34);
  /* مقیاس بزرگ‌تر: کالا مثل عکس واقعی، قاب را پر می‌کند (برش دایره‌ای سالم) */
  const g = isA
    ? place(GLYPHS[glyph], 400, 401, 2.1, -3, PINE, 3)
    : place(GLYPHS[glyph], 397, 396, 2.05, 5, PINE, 3);
  const accents = isA
    ? dot(72, 728, 7, 0.75) + plus(728, 72, 14, 2.5, 0.5)
    : dot(728, 72, 6, 0.7) + plus(72, 728, 12, 2.5, 0.45);
  const body =
    `<rect width="800" height="800" fill="url(#bg)"/>` +
    arc(400, 400, 300, -40, 60, 1.5, 0.2) +
    r + g + accents;
  return svgDoc(800, 800, defs, body);
}

/* ══════════ اسلاید هیرو ۱۰۸۰×۱۳۵۰ (۴:۵) — عمق سبز، حلقه‌ها و شاخهٔ سرو ══════════ */
function slideSvg(num: 1 | 2 | 3): string {
  const angle = num === 1 ? 120 : num === 2 ? 160 : 200;
  const defs =
    lg("bg", PINE, PINE_LIGHT, angle) +
    glowDef("glow");

  let art = "";
  if (num === 1) {
    art =
      glowCircle("glow", 540, 500, 620) +
      ring(540, 560, 420, 2, 0.22) +
      ring(540, 560, 330, 1.5, 0.14) +
      arc(540, 560, 500, 200, 320, 1.5, 0.16) +
      cedarBranch(360, 900, 360, -60, 2, 0.5) +
      dot(180, 260, 6, 0.7) +
      plus(900, 220, 16, 2.5, 0.55) +
      dot(950, 980, 8, 0.5);
  } else if (num === 2) {
    art =
      glowCircle("glow", 420, 420, 620) +
      ring(180, 200, 340, 2.5, 0.2) +
      ring(700, 700, 280, 2, 0.22) +
      ring(700, 700, 200, 1.5, 0.14) +
      cedarBranch(780, 1080, 300, 70, 2, 0.45) +
      dot(940, 300, 7, 0.65) +
      plus(140, 900, 14, 2.5, 0.5);
  } else {
    art =
      glowCircle("glow", 540, 480, 640) +
      ring(540, 540, 440, 2, 0.16) +
      ring(540, 540, 340, 2, 0.2) +
      ring(540, 540, 230, 1.5, 0.28) +
      cedarBranch(260, 1060, 400, -75, 2, 0.5) +
      dot(180, 200, 8, 0.6) +
      plus(920, 180, 16, 2.5, 0.5) +
      dot(880, 1120, 6, 0.5);
  }
  const body = `<rect width="1080" height="1350" fill="url(#bg)"/>` + art;
  return svgDoc(1080, 1350, defs, body);
}

/* ══════════ کاشی تبلیغ — پس‌زمینهٔ روشن + گلیف بزرگ ══════════
   ابعاد دقیقاً مطابق اسلات‌های چیدمان (برای طراح: نسبت نهایی همین است) */
function adSvg(w: number, h: number, glyph: GlyphKey, variant: 1 | 2 | 3): string {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.32;
  const defs = lg("bg", IVORY, MIST, variant === 1 ? 120 : variant === 2 ? 240 : 300);
  const glyphScale = (Math.min(w, h) / 800) * 1.6;
  const art =
    ring(cx, cy, r, 2, 0.4) +
    arc(cx, cy, r * 1.35, -30, 80, 1.5, 0.22) +
    arc(cx, cy, r * 1.35, 150, 260, 1.5, 0.22) +
    place(GLYPHS[glyph], cx, cy, glyphScale, variant === 2 ? 4 : -3, PINE, 3.2) +
    dot(w * 0.1, h * 0.12, Math.min(w, h) * 0.012 + 3, 0.65) +
    plus(w * 0.9, h * 0.86, Math.min(w, h) * 0.02 + 6, 2.5, 0.5) +
    dot(w * 0.88, h * 0.14, Math.min(w, h) * 0.009 + 2, 0.45);
  const body = `<rect width="${w}" height="${h}" fill="url(#bg)"/>` + art;
  return svgDoc(w, h, defs, body);
}

/* ══════════ تصویر مقاله ۱۲۰۰×۸۰۰ — گلیف بزرگ کم‌رنگ ══════════ */
function articleSvg(glyph: GlyphKey, num: 1 | 2 | 3): string {
  const angle = num === 1 ? 135 : num === 2 ? 100 : 240;
  const rot = num === 1 ? -5 : num === 2 ? 4 : -3;
  const defs = lg("bg", IVORY, MIST, angle);
  const body =
    `<rect width="1200" height="800" fill="url(#bg)"/>` +
    ring(600, 400, 300, 1.5, 0.32) +
    arc(600, 400, 380, -60, 40, 1.5, 0.18) +
    place(GLYPHS[glyph], 600, 400, 2.35, rot, PINE, 2.6, 0.14) +
    dot(96, 96, 7, 0.8) +
    plus(1104, 704, 14, 2.5, 0.5);
  return svgDoc(1200, 800, defs, body);
}

/* ══════════ OG پیش‌فرض ۱۲۰۰×۶۳۰ — سبز عمیق + حلقه + درخت سرو ══════════ */
function ogSvg(): string {
  const defs = lg("bg", PINE, PINE_LIGHT, 135) + glowDef("glow");
  const body =
    `<rect width="1200" height="630" fill="url(#bg)"/>` +
    glowCircle("glow", 600, 315, 520) +
    ring(600, 315, 300, 1.5, 0.18) +
    ring(600, 315, 235, 2.5, 0.6) +
    cedarTree(600, 480, 310, 2.2, 0.8) +
    dot(170, 120, 7, 0.7) +
    plus(1030, 520, 13, 2.5, 0.55);
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

/* کاشی‌های تبلیغ — بنتو: مربع بزرگ + مستطیل عریض + ۲ مربع کوچک */
files.push(["ad-big-1.svg", adSvg(1440, 1440, "bp", 1)]);
files.push(["ad-wide-1.svg", adSvg(1440, 720, "mask", 2)]);
files.push(["ad-square-1.svg", adSvg(720, 720, "respiratory", 3)]);
files.push(["ad-square-2.svg", adSvg(720, 720, "bed", 1)]);
/* کاشی‌های جایگزین برای قالب‌های duo و trio */
files.push(["ad-duo-1.svg", adSvg(1680, 700, "glucose", 2)]);
files.push(["ad-duo-2.svg", adSvg(1680, 700, "scale", 1)]);
files.push(["ad-trio-1.svg", adSvg(1000, 1000, "orthopedic", 3)]);
files.push(["ad-trio-2.svg", adSvg(1000, 1000, "thermometer", 1)]);
files.push(["ad-trio-3.svg", adSvg(1000, 1000, "wheelchair", 2)]);

files.push(
  ["article-1.svg", articleSvg("bp", 1)],
  ["article-2.svg", articleSvg("glucose", 2)],
  ["article-3.svg", articleSvg("thermometer", 3)],
);
files.push(["og-default.svg", ogSvg()]);
/* بنرهای قدیمی حفظ می‌شوند تا لینک‌ها نشکنند — با زبان بصری جدید */
files.push(["banner-1.svg", adSvg(960, 400, "mask", 1)]);
files.push(["banner-2.svg", adSvg(960, 400, "orthopedic", 2)]);

for (const [name, svg] of files) {
  writeFileSync(join(OUT_DIR, name), svg + "\n", "utf8");
}
console.log(`✅ ${files.length} فایل SVG در public/placeholders ساخته شد.`);
