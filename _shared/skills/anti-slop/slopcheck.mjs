#!/usr/bin/env node
// Static check of HTML/CSS for the tells that make a page look machine-made. No dependencies, reads files only, never runs them.
// Rules are taken from the Hallmark design skill (https://github.com/Nutlope/hallmark, MIT): its "Floor" (FAIL) and "Reflex" gates (WARN).
// Usage: node slopcheck.mjs <file.html|file.css> ...      Waive a rule on purpose with a comment: /* slop-waive: rule-id - the real reason */
import { readFileSync } from 'node:fs'
const hueOf = hex => { let h = hex.replace('#', ''); if (h.length === 3) h = [...h].map(c => c + c).join(''); if (!/^[0-9a-f]{6}/i.test(h)) return null
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2
  if (!d) return null; const s = d / (1 - Math.abs(2 * l - 1)); if (s < 0.35) return null
  const hue = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return (hue * 60 + 360) % 360 }
export function check(src) {
  const out = [], line = i => src.slice(0, i).split('\n').length, add = (id, level, i, msg) => out.push({ id, level, line: line(i), msg })
  const waived = new Set([...src.matchAll(/slop-waive:\s*([\w-]+)\s*[-:–]\s*\S.{3,}/g)].map(m => m[1]))
  const blocks = [...src.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => ({ sel: m[1].trim(), body: m[2], at: m.index }))
  let colours = 0
  for (const { sel, body, at } of blocks) {
    if (/\btransition(-property)?\s*:[^;]*\ball\b/.test(body)) add('transition-all', 'FAIL', at, 'transition: all. Name the properties.')
    if (/\btransition(-property)?\s*:[^;]*\b(width|height|top|left)\b/.test(body)) add('animate-layout', 'FAIL', at, 'Animating width, height, top or left. Animate transform or opacity.')
    if (/background-clip\s*:\s*text/.test(body) && /gradient/.test(body)) add('gradient-text', 'FAIL', at, 'Gradient fill on text. Use solid ink.')
    for (const g of body.matchAll(/gradient\(([^;]*)\)/g)) { const hues = [...g[1].matchAll(/#[0-9a-f]{3,8}\b/gi)].map(h => hueOf(h[0])).filter(h => h !== null)
      const purple = hues.some(h => h >= 255 && h <= 325), cool = hues.filter(h => h >= 195 && h <= 335).length >= 2   // a purple stop plus a blue, pink or second purple stop
      if ((purple && cool) || /\b(purple|violet|indigo)\b/i.test(g[1])) add('purple-gradient', 'FAIL', at, 'Purple-to-blue or purple-to-pink gradient. Pick one anchor hue.') }
    if (/100vw/.test(body)) add('vw-width', 'FAIL', at, '100vw causes sideways scroll. Use 100%.')
    if (/^(html|body)\b/.test(sel) && /overflow-x\s*:\s*hidden/.test(body)) add('overflow-hidden', 'FAIL', at, 'overflow-x: hidden on html/body. Use clip.')
    if (/text-transform\s*:\s*uppercase/.test(body) && /letter-spacing\s*:\s*(?!0\b|0(px|em|rem)?\b|normal)[\d.]/.test(body)) add('tracked-caps', 'FAIL', at, 'Tracked capitals on a label. Use sentence case, untracked.')
    if (/\bbackground(-color)?\s*:\s*(#000(000)?|#fff(fff)?|black|white)\s*[;}]?\s*$/m.test(body) || /\bbackground(-color)?\s*:\s*(#000(000)?|#fff(fff)?|black|white)\s*;/.test(body)) add('pure-black-white', 'WARN', at, 'Pure black or white surface. Tint toward the anchor hue.')
    const stripe = /\bborder-(left|inline-start)\s*:\s*(\d+(?:\.\d+)?)px\s+solid/.exec(body); if (stripe && +stripe[2] >= 3) add('side-stripe', 'WARN', at, 'Thick one-sided coloured border (side-stripe card).')
    for (const c of body.matchAll(/cubic-bezier\(\s*[-\d.]+\s*,\s*([-\d.]+)\s*,\s*[-\d.]+\s*,\s*([-\d.]+)\s*\)/g)) if (+c[1] > 1 || +c[1] < 0 || +c[2] > 1 || +c[2] < 0) add('bounce', 'WARN', at, 'Bounce or elastic easing. Use an exponential ease-out.')
    if (/min-height\s*:\s*100d?vh/.test(body) && (/text-align\s*:\s*center/.test(body) || /place-(items|content)\s*:\s*center/.test(body))) add('full-viewport-hero', 'WARN', at, 'Full-viewport centred hero. Let it be as tall as its content and bias it left or right.')
    if (!/:root|\[data-theme|\.dark|\.light/.test(sel)) colours += (body.match(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/gi) ?? []).length
  }
  if (colours > 12) add('literal-colours', 'WARN', 0, `${colours} colour values outside the :root tokens. Declare each colour once as a token.`)
  const hasUi = /<(a|button|input|select|textarea)\b/i.test(src) || /(^|[\s,}])(a|button)\b[^{]*\{/.test(src)
  if (hasUi && !/:focus-visible/.test(src)) add('focus-visible', 'FAIL', 0, 'No :focus-visible style for interactive elements.')
  if (/\btransition\s*:|\banimation\s*:|@keyframes/.test(src) && !/prefers-reduced-motion/.test(src)) add('reduced-motion', 'FAIL', 0, 'Animation without a prefers-reduced-motion fallback.')
  const fams = [...src.matchAll(/font-family\s*:\s*([^;}]+)/g)].map(m => m[1].split(',')[0].replace(/["'\s]/g, '').toLowerCase()).filter(f => f && !f.startsWith('var('))
  if (fams.length && new Set(fams).size === 1 && /^(inter|roboto|opensans|system-ui|-apple-system|arial|helvetica)$/.test(fams[0])) add('one-font', 'WARN', 0, `Only ${fams[0]} everywhere. Pair a display face with a body face.`)
  const img = /<img\b[^>]*>/i.exec(src); if (img && /loading\s*=\s*["']lazy/i.test(img[0])) add('lazy-first-image', 'WARN', img.index, 'The first image is lazy-loaded. If it is the hero, use fetchpriority="high".')
  for (const v of src.matchAll(/<video\b[^>]*>/gi)) if (/\bautoplay\b/i.test(v[0]) && !/\bmuted\b/i.test(v[0])) add('autoplay-sound', 'FAIL', v.index, 'Autoplay video without muted.')
  const h = /<h[1-3][^>]*>[^<]*<(em|i)>[^<\s]+<\/\1>[^<]*<\/h[1-3]>/i.exec(src); if (h) add('italic-word', 'FAIL', h.index, 'One italic word inside a roman heading.')
  const dot = /^(?!.*[{};]).*\S\s·\s\S.*\s·\s\S/m.exec(src.replace(/<style[\s\S]*?<\/style>/gi, m => m.replace(/[^\n]/g, ' '))); if (dot) add('middle-dot-meta', 'WARN', dot.index, 'Meta text joined with middle dots.')
  const emo = /<(button|li|h[1-6]|span|a)\b[^>]*>\s*\p{Extended_Pictographic}/u.exec(src); if (emo) add('emoji-icon', 'WARN', emo.index, 'Emoji used as an icon. Use a real icon set or none.')
  const cols = (src.match(/grid-template-columns\s*:\s*repeat\(\s*3\s*,\s*1fr\s*\)/g) ?? []).length; if (cols) add('three-columns', 'WARN', src.search(/repeat\(\s*3\s*,\s*1fr\s*\)/), 'Three equal columns (icon, heading, text) is the default feature grid. Vary widths or drop the cards.')
  return out.filter(o => !waived.has(o.id)).sort((a, b) => a.line - b.line)
}
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('slopcheck.mjs')) {
  const files = process.argv.slice(2)
  if (files[0] === '--self-test') {
    const assert = (c, m) => { if (!c) { console.error('slopcheck self-check: ' + m); process.exit(1) } }
    const bad = `<style>:root{--a:#123}.hero{min-height:100vh;text-align:center;background:linear-gradient(135deg,#7c3aed,#3b82f6)}h1{background:linear-gradient(#f0f,#00f);-webkit-background-clip:text}.btn{transition:all .2s;transition:width 1s;transition-timing-function:cubic-bezier(.68,-.55,.27,1.55)}.l{text-transform:uppercase;letter-spacing:.2em}body{overflow-x:hidden;background:#fff;width:100vw}.c{border-left:4px solid #0a0}.g{grid-template-columns:repeat(3,1fr)}@keyframes x{}*{font-family:Inter}</style><h1>Built to <em>think</em> fast</h1><button>🚀 Go</button><video autoplay></video><img loading="lazy" src=a><p>a · b · c</p>`
    const ids = new Set(check(bad).map(o => o.id)); for (const id of ['transition-all', 'animate-layout', 'gradient-text', 'purple-gradient', 'vw-width', 'overflow-hidden', 'tracked-caps', 'pure-black-white', 'side-stripe', 'bounce', 'full-viewport-hero', 'focus-visible', 'reduced-motion', 'one-font', 'lazy-first-image', 'autoplay-sound', 'italic-word', 'middle-dot-meta', 'emoji-icon', 'three-columns']) assert(ids.has(id), 'missing ' + id)
    assert(check('<style>.h{background:linear-gradient(135deg,#7c3aed,#3b82f6)}</style>').some(o => o.id === 'purple-gradient') && check('<style>.h{background:linear-gradient(#a855f7,#ec4899)}</style>').some(o => o.id === 'purple-gradient') && !check('<style>.h{background:linear-gradient(#f4f1ea,#e8e2d4)}</style>').some(o => o.id === 'purple-gradient') && !check('<style>.h{background:linear-gradient(#b4501e,#d9822b)}</style>').some(o => o.id === 'purple-gradient'), 'the classic purple-to-blue and purple-to-pink gradients are caught, warm and neutral ones are not')
    const good = `<style>:root{--ink:#1d2320;--paper:#f4f1ea;--accent:#b4501e}html,body{overflow-x:clip}body{background:var(--paper);color:var(--ink);font-family:Georgia,serif}a{transition:color .15s}a:focus-visible{outline:2px solid var(--accent)}@media (prefers-reduced-motion:reduce){a{transition:none}}.l{font-size:.85rem}</style><h1>Bread from the village oven</h1><a href=/order>Order</a>`
    assert(check(good).length === 0, 'a clean page is flagged: ' + JSON.stringify(check(good)))
    assert(!check(bad + '/* slop-waive: transition-all - the loader needs it */').some(o => o.id === 'transition-all') && check(bad + '/* slop-waive: transition-all */').some(o => o.id === 'transition-all'), 'a waiver needs a reason')
    console.log('slopcheck ok'); process.exit(0)
  }
  if (!files.length) { console.error('usage: node slopcheck.mjs <file.html|file.css> ...'); process.exit(2) }
  let fails = 0
  for (const f of files) { let src; try { src = readFileSync(f, 'utf8') } catch (e) { console.error(`${f}: cannot read`); fails++; continue }
    const r = check(src); for (const o of r) console.log(`${o.level} ${f}:${o.line} [${o.id}] ${o.msg}`); fails += r.filter(o => o.level === 'FAIL').length; if (!r.length) console.log(`OK ${f}`) }
  process.exit(fails ? 1 : 0)
}
