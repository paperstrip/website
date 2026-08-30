#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Bascule le site sur un nom de domaine propre.

    python3 tools/set-domain.py arnaudherr.be
    python3 tools/set-domain.py arnaudherr.be --dry-run

L'URL de base apparait a plus de cent endroits : adresses canoniques, Open
Graph, identifiants du graphe JSON-LD, sitemap, robots.txt, llms.txt. Une
recherche manuelle en oublie toujours, et un @id oublie casse la consolidation
d'entite sans que rien ne le signale.

L'URL actuelle est lue dans l'adresse canonique de l'accueil, donc le script
reste utilisable pour un futur changement de domaine.

Le script ecrit aussi le fichier CNAME que GitHub Pages attend.

Apres migration, cote GitHub : Settings, Pages, Custom domain, saisir le
domaine et cocher Enforce HTTPS une fois le certificat emis. Cote registrar :
un enregistrement ALIAS ou ANAME a l'apex vers paperstrip.github.io, ou quatre
enregistrements A vers les adresses publiees par GitHub.

A ne pas oublier ensuite : declarer la nouvelle propriete dans la Search
Console et y deposer le sitemap. Les anciennes URL en github.io ne peuvent pas
etre redirigees en 301 depuis GitHub Pages ; si elles ont ete indexees, la
Search Console de l'ancienne propriete permet de demander leur retrait.
"""
import io, os, re, sys

CIBLES = ["index.html", "sites-web-ia/index.html", "saas-sur-mesure/index.html",
          "ia-maitrisee/index.html", "contact/index.html",
          "sitemap.xml", "robots.txt", "llms.txt", "README.md", "tools/sitemap.py"]


def base_actuelle():
    """Lit l'URL de base dans l'adresse canonique de l'accueil.

    Plus fiable qu'une constante en dur : le script reste utilisable pour un
    futur changement de domaine, pas seulement pour le premier.
    """
    s = io.open("index.html", encoding="utf-8").read()
    m = re.search(r'rel="canonical" href="([^"]+)"', s)
    if not m:
        sys.exit("adresse canonique introuvable dans index.html")
    return m.group(1)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    dry = "--dry-run" in sys.argv
    if len(args) != 1:
        sys.exit("usage: python3 tools/set-domain.py <domaine> [--dry-run]")

    domaine = args[0].strip().lower()
    domaine = re.sub(r"^https?://", "", domaine).strip("/")
    if not re.match(r"^[a-z0-9.-]+\.[a-z]{2,}$", domaine):
        sys.exit("domaine invalide : " + domaine)
    nouveau = "https://" + domaine + "/"

    ancien = base_actuelle()
    if ancien == nouveau:
        sys.exit("le site est deja sur " + nouveau)
    print("de  :", ancien)
    print("vers:", nouveau, "\n")

    total = 0
    for f in CIBLES:
        if not os.path.exists(f):
            print("  absent, ignore :", f)
            continue
        s = io.open(f, encoding="utf-8").read()
        n = s.count(ancien)
        if not n:
            continue
        total += n
        if not dry:
            io.open(f, "w", encoding="utf-8").write(s.replace(ancien, nouveau))
        print("  %-28s %3d remplacements" % (f, n))

    if not dry:
        io.open("CNAME", "w", encoding="utf-8").write(domaine + "\n")
        print("  CNAME ecrit :", domaine)

    print("\n%d remplacements%s" % (total, " (simulation)" if dry else ""))
    if not dry:
        print("\nEnsuite :")
        print("  1. python3 tools/sitemap.py")
        print("  2. commiter, pousser")
        print("  3. GitHub : Settings > Pages > Custom domain, puis Enforce HTTPS")
        print("  4. registrar : ALIAS/ANAME a l'apex vers paperstrip.github.io")
        print("  5. Search Console : nouvelle propriete, deposer le sitemap")
        print("  6. remplacer arnaudherr@gmail.com par une adresse au domaine")


if __name__ == "__main__":
    main()
