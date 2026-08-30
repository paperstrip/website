# Site de présentation — Arnaud Herr

Page statique servie par GitHub Pages. Aucune étape de build : le HTML, le CSS
et le JS tiennent dans `index.html`.

```
index.html      homepage (CSS + JS inline)
404.html        page d'erreur
robots.txt      indexation + déclaration du sitemap
sitemap.xml     une seule URL pour l'instant
assets/og.jpg   image de partage Open Graph (1200×630)
assets/fonts/   Plus Jakarta Sans (variable, woff2, latin + latin-ext)
.nojekyll       désactive le traitement Jekyll de GitHub Pages
```

## URL canonique

L'URL du site apparaît dans `index.html` (canonical, Open Graph, JSON-LD),
`sitemap.xml` et `robots.txt`. En cas de changement de domaine, remplacer
partout `https://paperstrip.github.io/website/`.

⚠️ Sur un site de projet GitHub Pages, `robots.txt` n'est lu par les moteurs
qu'à la racine du domaine (`paperstrip.github.io/robots.txt`), pas dans le
sous-dossier. Tant qu'il n'y a pas de domaine propre, déclarer le sitemap
directement dans la Search Console.

## Développement

```
npx http-server . -p 8080
```

Ouvrir `index.html` en `file://` fonctionne aussi, à ceci près que la fonte
locale est bloquée par CORS — le rendu retombe alors sur la police système.

## Points ouverts

- Les photos sont en hotlink Unsplash : à rapatrier dans `assets/` en WebP
  redimensionné avant une mise en ligne durable (perf + LCP).
- Une seule page pour l'instant ; toute page ajoutée doit être reportée
  dans `sitemap.xml`.
