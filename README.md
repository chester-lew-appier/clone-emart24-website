# clone-emart24-website

A responsive static recreation of four pages from [emart24.com.my](https://emart24.com.my/),
built as a front-end prototype.

**Unaffiliated prototype.** Not operated by or endorsed by emart24 or Emart24 Holdings Sdn Bhd.
Copy and imagery belong to emart24; they are reproduced here for demonstration only.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home — two-slide promo hero, welcome strip, five feature bands, Instagram block |
| `food.html` | Food — Ready-To-Eat (40 items) and Street Food (29 items) tabbed panels |
| `halal.html` | Halal — e-kafe intro, certification panel, 37 certified outlets, news coverage |
| `locations.html` | Locations — 108 outlets with a 12-state filter |

## Structure

```
index.html  food.html  halal.html  locations.html
styles.css        design system and all page styles
script.js         nav, hero rotator, food tabs, locations filter
data.js           menu, outlets, certified list and news data
assets/           110 images
```

Framework-free: plain HTML, CSS and JavaScript. Roboto is loaded from Google Fonts;
everything else is local.

`data.js` holds the repeated content as data, so the product grid, outlet cards, certified
list and news cards are rendered from arrays rather than duplicated markup. To change an
outlet or menu item, edit `data.js`.

## Running it

Serve the folder over HTTP (the pages use relative asset paths):

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

## Notes on fidelity

Content, layout, colours and type were taken from the live site. Measured values in use:
brand yellow `#FCB426`, certification panel `#FFC412`, slate panel `#6E7A8C`, 1152px
content width, Roboto throughout.

Deliberate departures, all for accessibility, none changing the visible design:

- The source renders each outlet's state name with `visibility: hidden`. Here it is
  screen-reader-only instead, so assistive tech can still read it.
- A screen-reader-only result count announces filter changes on the Locations page.
- `index.html` gets a screen-reader-only `<h1>` (its text is the page's own `<title>`),
  because the source homepage has no `h1`.

Known gaps, inherited from the source:

- The subscribe form is inert. The live form is injected by a third-party script, so no
  endpoint is available to reproduce.
- Two homepage buttons — "Get ready to indulge" and "Explore exclusive brands" — point to
  `/food/reserve-cafe/` and `/exclusive-brands/no-brand/`, which currently return 404 on
  the live site. The links are reproduced as published.
- Pages outside this build (About, Press, Careers, Contact, FAQ E-Invoice, emart24 MY App,
  policy pages) link out to the live site.
