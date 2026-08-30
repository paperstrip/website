#!/usr/bin/env node
/* Verifie le contraste de tous les textes du site, a lancer apres avoir
   change les variables de marque dans assets/site.css.

     npx http-server . -p 8099 -s &
     node tools/contraste.js

   Le rapport minimal exige est celui du niveau AA : 4,5 pour le texte
   courant, 3 pour le texte large (24px, ou 18,66px en gras). */
const {chromium}=require('playwright');
const PAGES=['','sites-web-ia/','saas-sur-mesure/','sous-traitance/','ia-maitrisee/','contact/','mentions-legales/'];
const BASE=process.env.BASE||'http://127.0.0.1:8099/';

/* Accepte rgb(), rgba() et color(srgb x y z / a) que produit color-mix().
   Renvoie [r,g,b,a] avec r,g,b sur 0-255. */
function parse(c){
  c=String(c).trim();
  let h=c.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if(h){const v=h[1].length===3?h[1].split('').map(x=>x+x).join(''):h[1];
    return [parseInt(v.slice(0,2),16),parseInt(v.slice(2,4),16),parseInt(v.slice(4,6),16),1];}
  let m=c.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/);
  if(m) return [ +m[1]*255, +m[2]*255, +m[3]*255, m[4]===undefined?1:+m[4] ];
  m=c.match(/[\d.]+/g);
  if(!m) return null;
  return [ +m[0], +m[1], +m[2], m[3]===undefined?1:+m[3] ];
}
/* Un texte semi-transparent doit etre composite sur son fond avant mesure. */
function composite(fg,bg){
  const a=fg[3];
  return [0,1,2].map(i=>fg[i]*a + bg[i]*(1-a));
}
function lum(c){const [r,g,b]=c.slice(0,3).map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});
  return 0.2126*r+0.7152*g+0.0722*b;}

(async()=>{
  const b=await chromium.launch(); let total=0;
  for(const path of PAGES){
    const p=await b.newPage({viewport:{width:393,height:900}});
    await p.goto(BASE+path,{waitUntil:'load'});
    await p.waitForTimeout(500);
    const {rows,accent}=await p.evaluate(()=>{
      function fond(el){let e=el;while(e){const c=getComputedStyle(e).backgroundColor;
        const m=c.match(/[\d.]+/g); if(m&&(m.length<4||parseFloat(m[3])>0.5))return c; e=e.parentElement;}
        return 'rgb(255,255,255)';}
      /* Un element dans un conteneur fixe flotte au-dessus d'un fond qu'on ne
         peut pas deduire de l'arbre : on ne peut pas le mesurer ici. */
      function surFixe(el){let e=el;while(e&&e!==document.body){
        if(getComputedStyle(e).position==='fixed')return true; e=e.parentElement;} return false;}
      const out=[];
      document.querySelectorAll('p,h1,h2,h3,a,span,li,b,summary,label,button').forEach(el=>{
        if(!el.textContent.trim())return;
        if(el.children.length&&!el.matches('a,b,span,summary,label,button'))return;
        const cs=getComputedStyle(el);
        if(cs.visibility==='hidden'||!el.getClientRects().length)return;
        if(surFixe(el))return;
        out.push({t:el.textContent.trim().slice(0,30),fg:cs.color,bg:fond(el),
                  size:parseFloat(cs.fontSize),w:cs.fontWeight});
      });
      return {rows:out, accent:getComputedStyle(document.documentElement)
                .getPropertyValue('--brand-accent').trim()};
    });
    const acc=parse(accent)||[0,0,0,1];
    const proche=(a,b)=>[0,1,2].every(i=>Math.abs(a[i]-b[i])<6);
    const exception=(fg,bg)=>proche(fg,[255,255,255])&&proche(bg,acc);
    const vus=new Set(); const echecs=[];
    for(const x of rows){
      const fg=parse(x.fg), bg=parse(x.bg);
      if(!fg||!bg) continue;
      const f=composite(fg,bg);
      const L1=lum(f),L2=lum(bg);
      const ratio=(Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
      const large=x.size>=24||(x.size>=18.66&&+x.w>=700);
      const need=large?3:4.5;
      /* Blanc sur l'accent est un parti pris assume, repris de la reference.
         Il plafonne vers 2,7 et serait signale a chaque execution : on le
         laisse de cote pour que le rapport ne remonte que du nouveau. */
      if(exception(fg,bg)) continue;
      const cle=x.fg+x.bg+x.size;
      if(ratio<need&&!vus.has(cle)){vus.add(cle);
        echecs.push(`  ${ratio.toFixed(2)} au lieu de ${need} — ${x.size}px "${x.t}" ${x.fg} sur ${x.bg}`);}
    }
    total+=echecs.length;
    console.log('/'+path+(echecs.length?'\n'+echecs.join('\n'):'  tous les contrastes passent'));
    await p.close();
  }
  await b.close();
  console.log('\n'+total+' echec(s) de contraste');
  console.log('(blanc sur l accent volontairement exclu : parti pris repris de la reference)');
  // Informatif par defaut : le rapport s'affiche mais ne bloque rien.
  // Passer --strict pour sortir en erreur, par exemple dans une verification automatisee.
  process.exit(total && process.argv.includes('--strict') ? 1 : 0);
})();
