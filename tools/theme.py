#!/usr/bin/env python3
"""Rhabille le site en remplaçant les huit variables de marque de assets/site.css.

    python3 tools/theme.py --liste          voir les palettes disponibles
    python3 tools/theme.py --actuelle       voir les couleurs en place
    python3 tools/theme.py ardoise          appliquer une palette
    python3 tools/theme.py ardoise --essai  afficher le diff sans écrire

Les palettes vivent dans tools/palettes.json. Après application, relancer
la vérification de contraste :  node tools/contraste.js
"""
import json
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
CSS = RACINE / "assets" / "site.css"
PALETTES = json.loads((RACINE / "tools" / "palettes.json").read_text(encoding="utf-8"))

CLES = ["ink", "accent", "second", "tint", "tint2", "page", "light", "shade"]
VARIABLES = {
    "ink": "--brand-ink",
    "accent": "--brand-accent",
    "second": "--brand-second",
    "tint": "--brand-tint",
    "tint2": "--brand-tint-2",
    "page": "--brand-page",
    "light": "--brand-light",
    "shade": "--brand-shade",
}


def lire_actuelle(css):
    actuelle = {}
    for cle, var in VARIABLES.items():
        m = re.search(r"^(\s*)" + re.escape(var) + r"\s*:\s*(#[0-9A-Fa-f]{3,8})\s*;", css, re.M)
        if not m:
            sys.exit("variable introuvable dans site.css : " + var)
        actuelle[cle] = m.group(2)
    return actuelle


def appliquer(css, palette):
    for cle, var in VARIABLES.items():
        valeur = palette[cle]
        css, n = re.subn(
            r"^(\s*" + re.escape(var) + r"\s*:\s*)#[0-9A-Fa-f]{3,8}(\s*;)",
            lambda m: m.group(1) + valeur + m.group(2),
            css,
            count=1,
            flags=re.M,
        )
        if n != 1:
            sys.exit("remplacement impossible pour " + var)
    return css


def main():
    args = [a for a in sys.argv[1:]]
    essai = "--essai" in args or "--dry-run" in args
    args = [a for a in args if not a.startswith("--") or a in ("--liste", "--actuelle")]
    css = CSS.read_text(encoding="utf-8")
    actuelle = lire_actuelle(css)

    if not args or "--liste" in args:
        courante = next(
            (n for n, p in PALETTES.items() if all(p[c].upper() == actuelle[c].upper() for c in CLES)),
            None,
        )
        for nom, p in PALETTES.items():
            marque = "  <- en place" if nom == courante else ""
            print("%-10s %-18s %s%s" % (nom, p["nom"], p["ink"] + " / " + p["accent"], marque))
        if courante is None:
            print("\npalette en place : aucune des ci-dessus (couleurs modifiées à la main)")
        return

    if "--actuelle" in args:
        for cle in CLES:
            print("%-8s %s" % (cle, actuelle[cle]))
        return

    nom = args[0]
    if nom not in PALETTES:
        sys.exit("palette inconnue : %s (voir --liste)" % nom)
    nouvelle = appliquer(css, PALETTES[nom])
    for cle in CLES:
        avant, apres = actuelle[cle], PALETTES[nom][cle]
        if avant.upper() != apres.upper():
            print("%-8s %s -> %s" % (cle, avant, apres))
    if essai:
        print("\n--essai : rien n'a été écrit")
        return
    CSS.write_text(nouvelle, encoding="utf-8")
    print("\n%s appliquée. Vérifier ensuite : node tools/contraste.js" % PALETTES[nom]["nom"])


if __name__ == "__main__":
    main()
