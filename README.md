# Site de présentation — Arnaud Herr

Site statique servi par GitHub Pages. Aucune étape de build : les pages sont
du HTML écrit tel quel, avec une feuille de style et un script partagés.

```
index.html            accueil — positionnement principal (agents dans les outils métier)
sites-web-ia/         sites statiques et WordPress conçus avec l'IA
saas-sur-mesure/      applications métier et SaaS sur mesure
ia-maitrisee/         page pilier : sortir du générique, performance, SEO et GEO
contact/              contact
404.html              page d'erreur (autonome, styles en ligne)
robots.txt            indexation + déclaration du sitemap
sitemap.xml           5 URL
assets/site.css       styles partagés par toutes les pages
assets/site.js        révélation au scroll, en-tête au scroll, menu mobile
assets/og.jpg         image de partage Open Graph (1200×630)
assets/fonts/         Plus Jakarta Sans (variable, woff2, latin + latin-ext)
.nojekyll             désactive le traitement Jekyll de GitHub Pages
```

## Architecture éditoriale

Deux niveaux de positionnement :

1. **L'accueil** porte l'offre principale — des agents IA qui vivent dans
   l'ERP, le CRM ou la boutique, branchés sur la donnée réelle.
2. **Les trois pages internes** portent le second niveau : une production
   assistée par IA mais tenue par un professionnel. `ia-maitrisee/` est la
   page pilier de cet argument ; `sites-web-ia/` et `saas-sur-mesure/` en sont
   les applications concrètes et pointent toutes deux vers elle.

## Ajouter une page

1. Copier une page interne existante et adapter le contenu.
2. Mettre à jour la navigation dans **chaque** page (`nav-links` et `m-menu`)
   ainsi que le pied de page — il n'y a pas de gabarit partagé.
3. Ajouter l'URL dans `sitemap.xml`.
4. Renseigner `title`, `meta description`, `link canonical`, les balises
   Open Graph et le JSON-LD (`BreadcrumbList` au minimum).

L'en-tête et le pied de page sont dupliqués dans chaque fichier. C'est
soutenable à cette échelle ; au-delà d'une dizaine de pages, il faudra passer
à un générateur.

## URL canonique

L'URL du site apparaît dans chaque page (canonical, Open Graph, JSON-LD),
dans `sitemap.xml` et dans `robots.txt`. En cas de changement de domaine,
remplacer partout `https://paperstrip.github.io/website/`.

⚠️ Sur un site de projet GitHub Pages, `robots.txt` n'est lu par les moteurs
qu'à la racine du domaine (`paperstrip.github.io/robots.txt`), pas dans le
sous-dossier. Tant qu'il n'y a pas de domaine propre, déclarer le sitemap
directement dans la Search Console.

## Développement

```
npx http-server . -p 8080
```

Ouvrir les fichiers en `file://` fonctionne pour une vérification rapide, à
ceci près que la fonte locale est bloquée par CORS : le rendu retombe alors
sur la police système.

## Points ouverts

- Les photos sont en hotlink Unsplash : à rapatrier dans `assets/` en WebP
  redimensionné avant une mise en ligne durable (perf + LCP).
- Les pages internes n'ont aucune image ; en ajouter une par page aiderait au
  partage social et à la lecture.
