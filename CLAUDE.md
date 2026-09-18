# CLAUDE.md

Personal portfolio site for Cardayell Morgan. Live at **https://www.cardayell.com**.

## Stack

- Hand-written HTML, CSS, and vanilla JavaScript. **No build step, no framework, no dependencies.**
- Deployed by **GitHub Pages** from the default branch. `CNAME` maps the site to `www.cardayell.com`.
- Fonts (Roboto, OCR-A) are self-hosted from `fonts/`.

## Layout

```
index.html            single page, all sections
css/
  style.css           the whole stylesheet; @imports the two files below
  variables.css       design tokens (color, fluid type scale, spacing, layout)
  fonts.css           @font-face declarations
js/
  main.js             sticky-header shadow, mobile menu, scrollspy, name-pronunciation button
  gallery.js          photo lightbox (prev/next, keyboard, swipe)
audio/                name pronunciation clip
favicon.svg           CM monogram
img/
  banner/             hero portrait + hex background pattern
  objects/            company logos, project screenshots
  photos/             photography gallery (img-1.jpg … img-N.jpg)
downloads/            resume + transcript PDFs
fonts/                Roboto + OCR-A .ttf files
```

### Page sections (in `index.html`, in page order)

`header` nav · `#main` → `.hero` (name + audio pronunciation button, summary,
résumé CTA), `#skills`, `#experience` (Work Experience), `#education`,
`#projects`, `#personal-life` (bio, photography gallery, volunteering)
· `footer` · `.contact-bar` (sticky bottom bar with email/LinkedIn/GitHub,
present on every page view) · `#lightbox` (photo viewer markup).

Sections are separated by `<div class="divider">` — the grey gradient bar.
There is no dedicated Contact section — `.contact-bar` covers that.

## Conventions

- **Design tokens live in `css/variables.css`.** Use `var(--…)`; don't hard-code colors or font sizes.
- **Mobile-first.** Base rules target small screens; `@media (min-width: …)` adds larger layouts. Typography and section spacing scale with `clamp()`, so hard breakpoints are rare (main ones: 720px, 768px, 820px).
- Class names are BEM-ish: `.block`, `.block__element`, `.block--modifier`.
- Icons are inline `<svg>` with `currentColor`. No icon font.
- Keep the visual identity: light grey background (`--primary-color2`), blue accent (`--primary-color`), OCR-A display headings with wide letter-spacing, gradient section dividers.
- External links get `target="_blank" rel="noopener"`. All content images get `width`, `height`, `loading="lazy"`, `decoding="async"` (except the hero portrait, which should load eagerly).

## Preview locally

```
python -m http.server 8000
```

Open http://localhost:8000. Hard-refresh (Ctrl+Shift+R) after CSS changes.

## Images

Never commit an unoptimized image. Before adding photos:

- Resize the longest edge to ~2000px, re-encode JPEG at quality ~80, strip EXIF.
- Gallery thumbnails: a ~600px version is enough for the grid.
- Keep originals out of the repo.
- `img/og-image.jpg` should be 1200×630 for social sharing.

## Content editing map

| To change… | Edit in `index.html` |
|---|---|
| Job entries | `.timeline` inside `#experience` — one `<li class="entry">` per role |
| Degree / transcript | the `.entry` inside `#education` |
| Skills | `.skills` groups inside `#skills` |
| Projects | `<article class="project">` blocks inside `#projects` |
| Bio, photography, and volunteering text | `#personal-life` |
| Gallery photos | the `<ul class="gallery">` list + files in `img/photos/` (shuffled and capped to 3 rows by `js/gallery.js`) |
| Contact links | `.contact-bar__list` (sticky bottom bar, all pages) and the `footer` |
| Name pronunciation audio | `.pronounce__audio` `<source>` in `.hero`; file lives in `audio/` |

Any link that should scroll to the very top of the page uses `href="#"`,
not `href="#top"` — the header is `position: sticky`, and anchor-scrolling
to a sticky element's own id is unreliable (its box already reads as
"near the top" mid-scroll, so the browser under-scrolls).
