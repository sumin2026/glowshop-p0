# GlowShop P0

GlowShop is a responsive product-selection demo for overseas shoppers. This build focuses on the complete P0 purchase flow: browse products, open product details, add from either surface, and manage a cart with live totals.

## Included

- Responsive product list with image, brand, name, rating, pricing, badges, and description
- Quick add from the product grid
- Product detail view with quantity controls and add-to-bag action
- Shopping bag with quantity updates, item removal, item count, subtotal, shipping, estimated tax, and total
- Empty bag and invalid product states
- Desktop, tablet, and mobile layouts
- Strict TypeScript build

## Run locally

Requirements: Node.js 18+ and pnpm 9+.

```bash
pnpm install
pnpm run dev
```

The development server opens at `http://localhost:5173` by default.

## Production build

```bash
pnpm run build
pnpm run preview
```

`pnpm run build` runs TypeScript project checks before generating the production bundle in `dist/`.

## Implementation notes

- The project uses React, Vite, and strict TypeScript.
- Routing uses URL query parameters, so product and cart views remain compatible with static hosting without server-side rewrite rules.
- Product information is local mock data. Product photography is loaded from Unsplash.
- Checkout is intentionally simulated; no payment or personal data is collected.
- Shipping is free from $150, otherwise $12. Estimated tax is fixed at 8% for demo purposes.
