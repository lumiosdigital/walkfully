# Walkfully — Shopify Theme

Custom Shopify theme powering [walkfully.com](https://walkfully.com), the store for **Walkfully** — a direct-to-consumer weighted walking gear brand ("Walk more. Walk forever.") selling hip-loaded belts, packs and walk weights.

Built by Nicolas Cantarelli at Lumios Digital, on top of Haven, a commercial base theme. The commerce foundation is Haven; the brand and content layer described below is the work in this repo.

## What the theme does

A modern Online Store 2.0 theme built around Shopify's newer primitives — theme blocks, Section Rendering API partials, and custom Web Components.

- **Theme blocks architecture** — 14 reusable blocks (heading, text, image, buttons, icon-and-text, spacing) including `_`-prefixed private blocks (hero/content/slide/grid internals) composed across 78 sections
- **Fetch-rendered partials** — quick add-to-cart, quick search results, and pickup availability load through dedicated `fetch-*` sections via the Section Rendering API
- **Faceted collection browsing** — facet grid with filtering, plus a collection-compare section for side-by-side product comparison
- **Product storytelling** — interactive science/product-explore section, scroll-line animation, marquee banners, accordion panels
- **Klaviyo integration** — signup modal wired to Klaviyo's Client API v3 with reCAPTCHA v3 verification (public site identifiers only — no private keys in the theme)
- **Web Components** — interactive behavior (modals, explorers, scroll effects) implemented as custom elements
- **Centralized assets** — one `theme.css`/`theme.js` pair plus a vendor bundle; sections stay lean Liquid

## Structure

```
walkfully/
├── layout/                # theme.liquid + password.liquid
├── templates/             # 22 OS 2.0 JSON templates + customers/
├── sections/              # 78 sections — hero, featured collections,
│                          # facet grid, compare, science explorer,
│                          # fetch-* partials, announcement, footer, …
├── blocks/                # 14 theme blocks (public + _private)
├── snippets/              # 88 snippets — icons, cards, Klaviyo modal, …
├── assets/                # theme.css / theme.js / vendor bundles
├── config/                # settings_schema + settings_data
└── locales/
```

## Development

```bash
shopify theme dev --store <store>.myshopify.com   # Local preview with hot reload
shopify theme push                                 # Deploy
```

## License

Proprietary client work. Theme code, content, branding, and imagery belong to Walkfully.
