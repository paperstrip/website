#!/usr/bin/env python3
"""Recopie les questions fréquentes visibles dans le balisage FAQPage.

Les deux se désynchronisent dès qu'on édite le HTML sans penser au schema, et
Google considère un FAQPage qui ne correspond pas au contenu visible comme
trompeur. Ce script rend la page seule source de vérité.

    python3 tools/faq-sync.py            vérifie et corrige toutes les pages
    python3 tools/faq-sync.py --verifie  signale sans écrire, sortie non nulle
"""
import html
import json
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
RX_LD = re.compile(r'(<script type="application/ld\+json">\n)(.*?)(\n</script>)', re.S)
RX_DET = re.compile(r'<details>\s*<summary>(.*?)</summary>\s*<p>(.*?)</p>\s*</details>', re.S)
RX_TAG = re.compile(r'<[^>]+>')


def texte(fragment):
    return html.unescape(RX_TAG.sub('', fragment)).strip()


def main():
    verifie = '--verifie' in sys.argv
    souci = 0
    for page in sorted(RACINE.glob('*/index.html')) + [RACINE / 'index.html']:
        s = page.read_text(encoding='utf-8')
        m = RX_LD.search(s)
        if not m or '"FAQPage"' not in s:
            continue
        graphe = json.loads(m.group(2))
        visibles = [(texte(q), texte(a)) for q, a in RX_DET.findall(s)]
        if not visibles:
            continue
        for noeud in graphe.get('@graph', []):
            if noeud.get('@type') != 'FAQPage':
                continue
            attendu = [{"@type": "Question", "name": q,
                        "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in visibles]
            if noeud.get('mainEntity') == attendu:
                continue
            souci += 1
            rel = page.relative_to(RACINE)
            if verifie:
                print('%s : %d question(s) visible(s), %d dans le schema'
                      % (rel, len(visibles), len(noeud.get('mainEntity', []))))
                continue
            noeud['mainEntity'] = attendu
            s = s[:m.start(2)] + json.dumps(graphe, ensure_ascii=False, indent=1) + s[m.end(2):]
            page.write_text(s, encoding='utf-8')
            print('%s : %d question(s) recopiee(s)' % (rel, len(visibles)))
    if not souci:
        print('schema et contenu visible deja identiques')
    sys.exit(1 if (verifie and souci) else 0)


if __name__ == '__main__':
    main()
