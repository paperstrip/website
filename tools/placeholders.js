// Génère les visuels de remplacement auto-hébergés de assets/img/.
// Ce sont des dégradés dérivés de la palette, pas des photographies : ils
// tiennent la place en attendant les vraies images, sans dépendre d'un tiers.
// Usage : NODE_PATH=/opt/node22/lib/node_modules node tools/placeholders.js
const { chromium } = require('playwright');
const path = require('path');

// nom, largeur, hauteur, trio de teintes
const IMAGES = [
  ['hero',            1900, 1267, ['#3D348B', '#171238', '#7678ED']],
  ['equipe-suivi',    1000, 1250, ['#4A3F7A', '#1C1734', '#8A7BD8']],
  ['dossiers',         900, 1200, ['#5A4A6E', '#221B33', '#9A86C4']],
  ['binome-ecran',     900, 1200, ['#3B4470', '#171B33', '#7480CC']],
  ['logistique',       900, 1200, ['#6B4A56', '#2A1B24', '#C08A6E']],
  ['code',             800, 1000, ['#2F2A5E', '#131028', '#6A62B8']],
  ['atelier',         1200,  800, ['#5C4B6B', '#231B2E', '#A392C8']],
  ['manifeste',       1800, 1200, ['#3D348B', '#191340', '#8E86E0']],
  ['distribution',     900,  720, ['#6E5A4A', '#2B2118', '#C79A72']],
  ['relation-client',  900,  720, ['#43476E', '#1A1B30', '#8288CE']],
  ['administratif',    900,  720, ['#57506B', '#211E2C', '#9B93BE']],
  ['serveurs',        1000, 1250, ['#2A3358', '#101427', '#5F6EA8']],
  ['reunion',         1800, 1200, ['#4A3B6E', '#1D1730', '#9083D0']],
];

const page = (w, h, c) => `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden}</style>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c[0]}"/>
      <stop offset=".58" stop-color="${c[1]}"/>
      <stop offset="1" stop-color="${c[2]}"/>
    </linearGradient>
    <filter id="b"><feGaussianBlur stdDeviation="${Math.round(Math.min(w, h) / 9)}"/></filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <g filter="url(#b)" opacity=".7">
    <ellipse cx="${w * 0.26}" cy="${h * 0.28}" rx="${w * 0.3}" ry="${h * 0.3}" fill="${c[2]}"/>
    <ellipse cx="${w * 0.78}" cy="${h * 0.74}" rx="${w * 0.34}" ry="${h * 0.32}" fill="${c[0]}"/>
    <ellipse cx="${w * 0.56}" cy="${h * 0.16}" rx="${w * 0.2}" ry="${h * 0.2}" fill="${c[1]}"/>
  </g>
</svg>`;

(async () => {
  const b = await chromium.launch();
  for (const [nom, w, h, c] of IMAGES) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.setContent(page(w, h, c), { waitUntil: 'load' });
    const out = path.join(__dirname, '..', 'assets', 'img', nom + '.jpg');
    await p.screenshot({ path: out, type: 'jpeg', quality: 82 });
    await p.close();
    console.log(nom + '.jpg  ' + w + 'x' + h);
  }
  await b.close();
})();
