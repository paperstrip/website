#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Regenere sitemap.xml a partir des dates git reelles.

A lancer depuis la racine du depot, apres avoir commite les modifications de
contenu : python3 tools/sitemap.py

changefreq et priority ne sont pas emis. Google a confirme les ignorer, Bing
aussi. Un lastmod inexact est pire que pas de lastmod du tout : les moteurs
cessent de lui faire confiance, d'ou la lecture des dates dans git plutot
qu'une valeur ecrite a la main.
"""
import io, subprocess, datetime, sys

BASE = "https://paperstrip.github.io/website/"

PAGES = [
    ("",                 "index.html"),
    ("sites-web-ia/",    "sites-web-ia/index.html"),
    ("saas-sur-mesure/", "saas-sur-mesure/index.html"),
    ("ia-maitrisee/",    "ia-maitrisee/index.html"),
    ("contact/",         "contact/index.html"),
    ("mentions-legales/","mentions-legales/index.html"),
]


def now():
    return datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat()


def lastmod(path):
    """Date du dernier commit touchant le fichier.

    Si le fichier a des modifications non commitees, c'est maintenant : le
    contenu en ligne sera plus recent que le dernier commit.
    """
    try:
        dirty = subprocess.check_output(
            ["git", "status", "--porcelain", "--", path],
            stderr=subprocess.DEVNULL).decode().strip()
        if dirty:
            return now()
        date = subprocess.check_output(
            ["git", "log", "-1", "--format=%cI", "--", path],
            stderr=subprocess.DEVNULL).decode().strip()
        return date or now()
    except Exception:
        return now()


def main():
    rows = []
    for slug, path in PAGES:
        rows.append("  <url>\n    <loc>%s%s</loc>\n    <lastmod>%s</lastmod>\n  </url>"
                    % (BASE, slug, lastmod(path)))
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<!-- Genere par tools/sitemap.py. Ne pas editer a la main.\n'
           "     changefreq et priority sont volontairement absents : les moteurs\n"
           "     les ignorent. Seul lastmod compte, a condition d'etre exact. -->\n"
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
           + "\n".join(rows) + "\n</urlset>\n")
    io.open("sitemap.xml", "w", encoding="utf-8").write(xml)
    sys.stdout.write("sitemap.xml regenere : %d URL\n" % len(PAGES))


if __name__ == "__main__":
    main()
