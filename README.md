# Philpanicio

A showcase site for Philpanicio, Phillip's home bakery. Visitors browse the cakes and breads, then order on WhatsApp.

**Live site:** https://andrew28kg.github.io/philpanicio/

- Built with [Astro](https://astro.build) as a static site, hosted free on GitHub Pages.
- There is **no database and no server**. All content lives in two JSON files plus the images in `src/assets/`.
- Bilingual (Bahasa Indonesia / English) with light and dark mode. Visitors switch these in the header, and the choice is remembered.
- Animations use GSAP + ScrollTrigger + Lenis. They switch off automatically for visitors who turn on "reduce motion".

---

## 1. Run it on your computer

You need [Node.js](https://nodejs.org) 22.12 or newer.

```bash
npm install        # first time only
npm run dev        # opens a live-reloading preview at http://localhost:4321/philpanicio/
```

Other commands:

| Command           | What it does                                                        |
| ----------------- | ------------------------------------------------------------------- |
| `npm run build`   | Builds the final site into `dist/` and checks the JSON for mistakes |
| `npm run preview` | Serves the built `dist/` folder, to check it exactly as it will go live |

> If `npm run build` fails after you edit a JSON file, read the message. It names the problem, e.g. a missing photo or a typo in a field.

---

## 2. Edit products — `src/data/products.json`

Each product is one `{ ... }` block in the list:

```json
{
  "id": "banana-bread",
  "name": { "id": "Roti Pisang", "en": "Banana Bread" },
  "description": { "id": "Lembut, wangi, pakai pisang matang.", "en": "Soft and fragrant, made with ripe bananas." },
  "price": 75000,
  "category": "bread",
  "image": "products/breads/banana-bread.jpg",
  "featured": true,
  "available": true
}
```

| Field         | What to put                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| `id`          | Unique short name: lowercase letters, numbers and dashes only (`banana-bread`)                               |
| `name`        | `{ "id": "...", "en": "..." }`, or a single string if it's the same in both languages                        |
| `description` | Same format as `name`                                                                                        |
| `price`       | Whole rupiah, digits only, with no dots or "Rp" (`75000`)                                                    |
| `category`    | `cake` or `bread`. To add a new category, also add its label in `site.json` → `ui.categories`              |
| `image`       | Path of the photo **inside `src/assets/`**, e.g. `products/breads/banana-bread.jpg`                          |
| `featured`    | `true` shows it in the "Signature Bakes" section                                                             |
| `available`   | `false` shows a "Currently unavailable" label instead of the order button                                    |

**To add a product:**

1. Copy an existing block.
2. Put a comma between blocks.
3. Change the values.
4. Add the photo (see section 4).

**To remove a product:** delete its block. Make sure no comma is left dangling after the last block.

**To hide a product temporarily:** set `"featured": false`.

Tapping a product opens a WhatsApp message that already names it, like:
*"Halo Philpanicio! Saya mau pesan **Roti Pisang** (Rp 75.000)…"*

---

## 3. Edit site text — `src/data/site.json`

Every sentence on the site lives here, in both languages. This includes the tagline, hero text, "Our Story", testimonials, the order section and the WhatsApp message templates. Edit the text between the quotes and leave the keys (the left side) alone.

Useful fields:

- `whatsapp`: the number in international format **without `+`** (`6287774435888`). Every WhatsApp button uses it.
- `email`, `social.tiktok`: contact links.
- `testimonials.items`: add or remove `{ "name", "note", "text" }` blocks. **The current ones are placeholders. Replace them with real quotes, with permission.**
- `messages.greeting` / `messages.product`: the pre-filled WhatsApp texts. `{product}` and `{price}` are filled in automatically.
- `gallery.items`: photos and captions for the "Display Case".
- `seo`: the title and description shown when the link is shared on WhatsApp.

---

## 4. Add or replace photos

All photos live in **`src/assets/`**. Astro resizes them and converts them to fast WebP/AVIF automatically.

```
src/assets/
  hero/        big cake photo at the top
  products/    cakes/ and breads/ product photos
  gallery/     Display Case photos
  story/       photo of Phillip
  og/          og-cover.jpg: the 1200×630 preview image for WhatsApp/social shares
  brand/       logo.jpg and logo-mark.jpg (round avatar in the header)
```

**To replace a placeholder:**

1. Drop your photo into the right folder, e.g. `src/assets/products/cakes/chocolate-orange-cake.jpg`.
2. Update the path in the JSON (`"image": "products/cakes/chocolate-orange-cake.jpg"`).
3. Delete the old `placeholder-*.jpg` file.

Tips:

- Use **JPG** (or PNG/WebP). Portrait 4:5 photos look best (e.g. 1200×1500). Big phone photos are fine because they get resized.
- File names: lowercase with dashes, no spaces (`strawberry-cake.jpg`). Paths are **case-sensitive** on the live server.
- The hero image is set in `site.json` → `hero.image`, and the baker photo in `story.image`.
- `npm run placeholders` regenerates any missing placeholder image. It never overwrites your photos.

> ⚠️ The phone number printed on the original logo artwork (`+62 877-7443-588`) is missing a digit. The site uses the correct number `+62 877-7443-5888`, and that line is cropped out of the images the site generates. Ask the designer to fix the logo file.

---

## 5. How deployment works

Every push to the `main` branch triggers `.github/workflows/deploy.yml`:

1. GitHub Actions checks out the code, installs packages and runs `npm run build` (the official `withastro/action`).
2. The `dist/` folder is published to GitHub Pages.
3. About 1–2 minutes later the site at https://andrew28kg.github.io/philpanicio/ is updated.

**Updating the site is therefore:**

1. Edit the JSON and/or add photos.
2. Run `git add -A`, `git commit -m "Update menu"` and `git push`.

You can watch progress in the repo's **Actions** tab.

### Why the `/philpanicio/` base path matters

GitHub serves the site from a sub-folder (`/philpanicio/`), so `astro.config.mjs` sets:

```js
site: 'https://andrew28kg.github.io',
base: '/philpanicio',
```

In code, never write links or image paths starting with `/`:

- Images go through Astro's image components (they handle the base path).
- Files in `public/` use `withBase('file.svg')` from `src/lib/paths.ts`.
- In-page links use `#section-id`.

If you rename the repo or move to a custom domain, update `base` (or remove it for a custom domain) and `site`.

---

## 6. Security — what's public and why that's fine

The repository is public, which free GitHub Pages requires. This is safe because:

- **There are no secrets.** No passwords, API keys, database or server exist. Everything in the repo (menu, prices, WhatsApp number, email) is meant to be shown on the public website anyway.
- `.gitignore` blocks `node_modules`, build output, `.env` files and key files, so nothing private gets committed by accident.
- The deploy workflow has only the minimum permissions it needs (`contents: read`, `pages: write`, `id-token: write`).
- Dependabot (`.github/dependabot.yml`) opens weekly pull requests to keep packages patched.
- No source maps are published.

**Rules to keep it that way:**

- Never commit passwords, bank details, customer names/phone numbers or order lists.
- Keep orders and customer chats in WhatsApp, not in this repo.

---

## 7. Planned: menu page and cart (not built yet)

The code is already structured for these:

- **Menu page:** create `src/pages/menu.astro` and reuse `ProductCard` + `ProductModal`. Use `getProducts()` / `getByCategory('cake')` from `src/lib/products.ts`. Link to it with `withBase('menu')`.
- **Cart:**
  - Add `src/scripts/cart.ts`, which keeps `{ id, qty }` items in `localStorage` (key `pp-cart`).
  - Put an "Add to cart" button next to "Order this" inside `.modal-actions` (each has `data-product-actions="<id>"`).
  - Build the checkout message with `orderMessage(items, lang)` from `src/lib/whatsapp.ts`, which already formats a multi-item order with a total. Open it with `waLink(message)`.
  - No server is needed.

---

## Project structure

```
src/
  data/        products.json, site.json   ← edit these
  assets/      photos                     ← add photos here
  components/  page sections (Hero, SignatureBakes, DisplayCase, OurStory, …)
  layouts/     Base.astro: <head>, SEO and link-preview tags
  lib/         helpers: products, images, whatsapp links, i18n, base paths
  scripts/     browser JS: toggles, modal, tilt, gallery, animations
  styles/      global.css: colours, fonts, shared styles
public/        favicon.svg
scripts/       make-placeholders.mjs
```
