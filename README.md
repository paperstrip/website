# Site de présentation — Arnaud Herr

Site statique servi par GitHub Pages. Aucune étape de build : les pages sont
du HTML écrit tel quel, avec une feuille de style et un script partagés.

```
index.html            accueil — positionnement principal (agents dans les outils métier)
sites-web-ia/         sites statiques et WordPress conçus avec l'IA
saas-sur-mesure/      applications métier et SaaS sur mesure
ia-maitrisee/         page pilier : sortir du générique, performance, SEO et GEO
contact/              contact
mentions-legales/     éditeur, hébergement, données personnelles
404.html              page d'erreur (autonome, styles en ligne)
robots.txt            indexation + déclaration du sitemap
sitemap.xml           généré, ne pas éditer à la main (6 URL)
llms.txt              résumé du site pour les moteurs génératifs
tools/sitemap.py      régénère sitemap.xml depuis les dates git
assets/site.css       styles partagés par toutes les pages
assets/site.js        révélation au scroll, en-tête au scroll, menu mobile
assets/og.jpg         image de partage Open Graph (1200×630)
assets/fonts/         Schibsted Grotesk (variable, woff2, latin + latin-ext)
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

## Changer les couleurs

Toute la palette découle de **huit variables** groupées en haut de
`assets/site.css`, sous le bandeau « LES SEULES VALEURS À CHANGER ». Le reste
en dérive par `color-mix()` : gris de texte, filets, teintes de survol,
échelle d'opacité sur fond sombre.

```css
--brand-ink     /* sombre : texte, aplats, pied de page */
--brand-accent  /* accent : boutons, liens, pastilles   */
--brand-second  /* secondaire : tuile de chiffre        */
--brand-tint    /* teinte claire : cartes               */
--brand-tint-2  /* teinte très claire : sections        */
--brand-page    /* fond de page                         */
--brand-light   /* texte sur fond sombre                */
--brand-shade   /* voile posé sur les photos            */
```

Ne modifiez pas les variables situées sous « dérivés » : elles sont
recalculées à partir des huit précédentes.

**Après tout changement de palette, lancez la vérification de contraste.**
Une teinte plus claire casse silencieusement la lisibilité des petits textes :

```
npx http-server . -p 8099 -s &
node tools/contraste.js
```

Le script parcourt les sept pages, composite les textes semi-transparents sur
leur fond réel et signale tout rapport inférieur au niveau AA (4,5 pour le
texte courant, 3 pour le texte large). Il sort en code d'erreur s'il trouve
quelque chose, ce qui permet de le brancher sur une intégration continue.

Une exception est volontairement ignorée : le blanc sur l'accent, qui plafonne
vers 2,7. C'est le parti pris de la référence, assumé.

## Données structurées

Le JSON-LD forme un seul graphe à l'échelle du site, relié par `@id` :

- `#person` et `#service` sont définis une seule fois, sur l'accueil
- chaque page interne les référence par `{"@id": "..."}` au lieu de les
  redéclarer, sinon les moteurs voient plusieurs entités « Arnaud Herr »
- chaque page a son `WebPage`, son `BreadcrumbList` et, s'il y a lieu, son
  `FAQPage`, tous identifiés par `@id`

En ajoutant une page, référencez `#person` par identifiant. Ne recopiez jamais
le nœud Person.

## Mentions légales

La page est complète pour la situation actuelle : personne physique, activité
en cours de lancement. Il manquera le **numéro d'entreprise BCE** dès
l'inscription. Un paragraphe l'annonce explicitement plutôt que de laisser un
vide.

Le site n'utilise aucun cookie ni outil de mesure d'audience, donc aucun
bandeau de consentement n'est nécessaire. **Si un jour vous ajoutez une mesure
d'audience, cette page devient fausse et un bandeau devient obligatoire.**

## Formulaire de contact

Le formulaire de `contact/index.html` poste vers Formspree
(`https://formspree.io/f/mrpgbwey`). Il fonctionne sans JavaScript, en POST
natif. Le champ `_gotcha` est un piège à robots : invisible pour l'utilisateur,
rempli par les robots, ce qui permet au service de rejeter l'envoi.

Le premier envoi demande une confirmation par mail côté Formspree. Le plan
gratuit est limité à quelques dizaines d'envois par mois ; au-delà, les
messages sont retenus jusqu'au mois suivant.

## Sitemap

`sitemap.xml` est généré par `tools/sitemap.py`, qui lit les dates de dernier
commit de chaque page. À lancer après avoir commité une modification de
contenu :

```
python3 tools/sitemap.py
```

`changefreq` et `priority` ne sont pas émis : Google a confirmé les ignorer et
Bing fait de même. Seul `lastmod` est exploité, et uniquement s'il est exact.

## Ajouter une page

1. Copier une page interne existante et adapter le contenu.
2. Mettre à jour la navigation dans **chaque** page (`nav-links` et `m-menu`)
   ainsi que le pied de page — il n'y a pas de gabarit partagé.
3. Ajouter l'URL dans `tools/sitemap.py`, puis relancer le script.
4. Ajouter l'entrée dans `llms.txt`.
4. Renseigner `title`, `meta description`, `link canonical`, les balises
   Open Graph et le JSON-LD (`BreadcrumbList` au minimum).

L'en-tête et le pied de page sont dupliqués dans chaque fichier. C'est
soutenable à cette échelle ; au-delà d'une dizaine de pages, il faudra passer
à un générateur.

## Changer de nom de domaine

L'URL de base apparaît à plus de cent endroits : adresses canoniques, Open
Graph, identifiants du graphe JSON-LD, sitemap, robots.txt, llms.txt. Un `@id`
oublié casse la consolidation d'entité sans que rien ne le signale.

```
python3 tools/set-domain.py arnaudherr.be --dry-run   # simulation
python3 tools/set-domain.py arnaudherr.be             # migration + CNAME
python3 tools/sitemap.py
```

Le script lit l'URL actuelle dans l'adresse canonique de l'accueil, il reste
donc utilisable pour un changement ultérieur.

Ensuite, côté GitHub : Settings, Pages, Custom domain, puis Enforce HTTPS une
fois le certificat émis. Côté registrar : un ALIAS ou ANAME à l'apex vers
`paperstrip.github.io`, ou les quatre enregistrements A publiés par GitHub.

Deux choses à ne pas oublier après la bascule :

- déclarer la nouvelle propriété dans la Search Console et y déposer le sitemap ;
- remplacer `arnaudherr@gmail.com` par une adresse au domaine. Une adresse Gmail
  sur un site qui vend de la rigueur technique coûte plus qu'elle ne rapporte.

GitHub Pages ne permet pas de rediriger les anciennes URL en 301. Si elles ont
été indexées, demander leur retrait depuis la Search Console de l'ancienne
propriété.

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
