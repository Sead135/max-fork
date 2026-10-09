#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const INDEX = path.join(ROOT, 'src/index.css');
const MAX_STYLES = path.join(
  ROOT,
  'node_modules/@maxhub/max-ui/dist/styles.css'
);

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (/\.(tsx?|jsx?|css)$/.test(ent.name) && ent.name !== 'index.css') {
      acc.push(p);
    }
  }
  return acc;
}

function collectRefs(files) {
  const used = new Set();
  const re = /--[a-zA-Z0-9-]+/g;
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(re)) used.add(match[0]);
  }
  return used;
}

function collectDefs(cssText) {
  const defs = new Set();
  for (const match of cssText.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)) {
    defs.add(match[1]);
  }
  return defs;
}

function parseThemeMaps(css) {
  const light = new Map();
  const dark = new Map();
  let mode = null;
  let depth = 0;
  let inDark = false;

  for (const line of css.split('\n')) {
    if (line.includes('@media (prefers-color-scheme: dark)')) inDark = true;
    if (/^\s*:root\s*\{/.test(line)) {
      mode = inDark ? 'dark' : 'light';
      depth = 1;
      continue;
    }
    if (!mode) continue;
    if (line.includes('{')) depth += 1;
    if (line.includes('}')) {
      depth -= 1;
      if (depth === 0) mode = null;
      continue;
    }
    const m = line.match(/^\s*(--[a-zA-Z0-9-]+)\s*:\s*(.+?);\s*$/);
    if (m) (mode === 'dark' ? dark : light).set(m[1], m[2]);
  }
  return { light, dark };
}

function expand(seed, defs) {
  const keep = new Set(seed);
  let changed = true;
  while (changed) {
    changed = false;
    for (const name of [...keep]) {
      const value = defs.get(name);
      if (!value) continue;
      for (const match of value.matchAll(/var\((--[a-zA-Z0-9-]+)[^)]*\)/g)) {
        if (defs.has(match[1]) && !keep.has(match[1])) {
          keep.add(match[1]);
          changed = true;
        }
      }
    }
  }
  return [...keep].sort();
}

const indexCss = fs.readFileSync(INDEX, 'utf8');
const maxCss = fs.existsSync(MAX_STYLES)
  ? fs.readFileSync(MAX_STYLES, 'utf8')
  : '';
const maxDefs = collectDefs(maxCss);
const used = collectRefs(walk(path.join(ROOT, 'src')));
const { light, dark } = parseThemeMaps(indexCss);

const IGNORE = new Set([
  '--button-ghost-text-color',
  '--button-ghost-text-color-disabled'
]);

const need = [...used]
  .filter((name) => !maxDefs.has(name) && !IGNORE.has(name))
  .filter((name) => light.has(name) || dark.has(name));

const keepLight = expand(need.filter((n) => light.has(n)), light);
const keepDark = expand(need.filter((n) => dark.has(n)), dark);
const all = [...new Set([...keepLight, ...keepDark])].sort();

const missing = need.filter((n) => !light.has(n) && !dark.has(n));
if (missing.length) {
  console.warn('Referenced but not defined in index.css:\n', missing.join('\n'));
}

function block(map, names, indent) {
  return names
    .filter((n) => map.has(n))
    .map((n) => `${indent}${n}: ${map.get(n)};`)
    .join('\n');
}

const out = `* {
  box-sizing: border-box;
}

html,
body,
#root {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
}

:root {
${block(light, all, '  ')}
}

@media (prefers-color-scheme: dark) {
  :root {
${block(dark, all, '    ')}
  }
}
`;

fs.writeFileSync(INDEX, out);
console.log(`${all.length} tokens → ${INDEX}`);
console.log(all.join('\n'));
