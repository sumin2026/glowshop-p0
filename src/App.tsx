import { useEffect, useMemo, useState } from "react";
import { getProduct, products } from "./data";
import { ArrowIcon, BackIcon, BagIcon, CloseIcon, MinusIcon, PlusIcon, StarIcon } from "./icons";
import type { CartLine, Product } from "./types";

type CartState = Record<string, number>;
type Route = { page: "shop" } | { page: "product"; id: string } | { page: "cart" };

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function getRoute(): Route {
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");
  if (view === "cart") return { page: "cart" };
  if (view === "product") return { page: "product", id: params.get("id") ?? "" };
  return { page: "shop" };
}

function App() {
  const [route, setRoute] = useState<Route>(getRoute);
  const [cart, setCart] = useState<CartState>({});
  const [toast, setToast] = useState("");

  useEffect(() => {
    const onPopState = () => setRoute(getRoute());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [route]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const cartLines = useMemo<CartLine[]>(
    () =>
      Object.entries(cart).flatMap(([id, quantity]) => {
        const product = getProduct(id);
        return product ? [{ product, quantity }] : [];
      }),
    [cart],
  );

  const itemCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);

  const navigate = (next: Route) => {
    const url =
      next.page === "shop"
        ? window.location.pathname
        : next.page === "cart"
          ? `${window.location.pathname}?view=cart`
          : `${window.location.pathname}?view=product&id=${encodeURIComponent(next.id)}`;
    window.history.pushState({}, "", url);
    setRoute(next);
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart((current) => ({ ...current, [product.id]: (current[product.id] ?? 0) + quantity }));
    setToast(`${product.name} added to your bag`);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((current) => ({ ...current, [id]: quantity }));
  };

  const removeFromCart = (id: string) => {
    setCart((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  return (
    <div className="app-shell">
      <Header itemCount={itemCount} navigate={navigate} />
      <main>
        {route.page === "shop" && (
          <ShopPage navigate={navigate} addToCart={addToCart} />
        )}
        {route.page === "product" && (
          <ProductPage
            product={getProduct(route.id)}
            navigate={navigate}
            addToCart={addToCart}
          />
        )}
        {route.page === "cart" && (
          <CartPage
            lines={cartLines}
            navigate={navigate}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
          />
        )}
      </main>
      <Footer navigate={navigate} />
      <div className={`toast ${toast ? "toast--visible" : ""}`} role="status" aria-live="polite">
        <span className="toast__dot" />
        {toast}
      </div>
    </div>
  );
}

function Header({ itemCount, navigate }: { itemCount: number; navigate: (route: Route) => void }) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <button className="brand" onClick={() => navigate({ page: "shop" })} aria-label="Go to shop home">
          <span className="brand__mark">G</span>
          <span>GlowShop</span>
        </button>
        <nav className="header-nav" aria-label="Main navigation">
          <button onClick={() => navigate({ page: "shop" })}>Shop all</button>
          <span className="header-note">Free shipping over $150</span>
        </nav>
        <button className="bag-button" onClick={() => navigate({ page: "cart" })} aria-label={`Open shopping bag with ${itemCount} items`}>
          <BagIcon />
          <span className="bag-button__label">Bag</span>
          <span className="bag-button__count">{itemCount}</span>
        </button>
      </div>
    </header>
  );
}

function ShopPage({ navigate, addToCart }: { navigate: (route: Route) => void; addToCart: (product: Product) => void }) {
  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__copy">
            <p className="eyebrow">The autumn edit · 2026</p>
            <h1>Everyday things,<br /><em>chosen better.</em></h1>
            <p className="hero__lede">
              Useful objects with a point of view—selected for thoughtful design, honest materials, and life beyond the unboxing.
            </p>
            <a className="button button--dark hero__cta" href="#collection">
              Shop the collection <ArrowIcon />
            </a>
          </div>
          <div className="hero__visual" aria-label="Curated GlowShop collection">
            <img src={products[0].image} alt={products[0].imageAlt} />
            <div className="hero__caption">
              <span>01</span>
              <p>Objects for<br />intentional living</p>
            </div>
            <span className="hero__orb hero__orb--one" />
            <span className="hero__orb hero__orb--two" />
          </div>
        </div>
      </section>

      <section className="collection container" id="collection">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Made to earn its place</p>
            <h2>The considered collection</h2>
          </div>
          <p>{products.length} pieces · Ships worldwide</p>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} navigate={navigate} addToCart={addToCart} />
          ))}
        </div>
      </section>
    </>
  );
}

function ProductCard({ product, navigate, addToCart }: { product: Product; navigate: (route: Route) => void; addToCart: (product: Product) => void }) {
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <article className="product-card">
      <button className="product-card__link" onClick={() => navigate({ page: "product", id: product.id })} aria-label={`View ${product.name}`}>
        <div className="product-card__media">
          <img src={product.image} alt={product.imageAlt} loading="lazy" />
          <div className="product-card__badges">
            {product.badge && <span className="badge badge--ink">{product.badge}</span>}
            {discount > 0 && <span className="badge badge--coral">-{discount}%</span>}
          </div>
        </div>
        <div className="product-card__content">
          <p className="product-card__brand">{product.brand}</p>
          <h3>{product.name}</h3>
          <p className="product-card__description">{product.shortDescription}</p>
          <div className="product-card__meta">
            <span className="rating"><StarIcon /> {product.rating}</span>
            <span className="price">
              {currency.format(product.price)}
              {product.originalPrice && <s>{currency.format(product.originalPrice)}</s>}
            </span>
          </div>
        </div>
      </button>
      <button className="quick-add" onClick={() => addToCart(product)} aria-label={`Add ${product.name} to bag`}>
        <PlusIcon /> <span>Quick add</span>
      </button>
    </article>
  );
}

function ProductPage({ product, navigate, addToCart }: { product?: Product; navigate: (route: Route) => void; addToCart: (product: Product, quantity: number) => void }) {
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <section className="empty-state container">
        <p className="eyebrow">404 · Product not found</p>
        <h1>This piece has left the collection.</h1>
        <p>The link may be outdated, but the rest of the edit is ready to browse.</p>
        <button className="button button--dark" onClick={() => navigate({ page: "shop" })}>Return to shop</button>
      </section>
    );
  }

  return (
    <section className="product-detail container">
      <button className="text-link product-detail__back" onClick={() => navigate({ page: "shop" })}>
        <BackIcon /> Back to collection
      </button>
      <div className="product-detail__grid">
        <div className="product-detail__media">
          <img src={product.image} alt={product.imageAlt} />
          {product.badge && <span className="product-detail__edition">{product.badge} edition</span>}
        </div>
        <div className="product-detail__info">
          <p className="eyebrow">{product.brand} · {product.category}</p>
          <h1>{product.name}</h1>
          <div className="product-detail__rating">
            <span><StarIcon /> {product.rating}</span>
            <span>{product.reviewCount} verified reviews</span>
          </div>
          <div className="product-detail__price">
            {currency.format(product.price)}
            {product.originalPrice && <s>{currency.format(product.originalPrice)}</s>}
          </div>
          <p className="product-detail__description">{product.description}</p>
          <ul className="feature-list">
            {product.features.map((feature) => <li key={feature}>{feature}</li>)}
          </ul>
          <div className="purchase-row">
            <QuantityControl value={quantity} onChange={setQuantity} label={`${product.name} quantity`} />
            <button className="button button--coral button--grow" onClick={() => addToCart(product, quantity)}>
              Add to bag · {currency.format(product.price * quantity)}
            </button>
          </div>
          <div className="service-strip">
            <span>✓ Free returns in 30 days</span>
            <span>✓ Two-year care promise</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuantityControl({ value, onChange, label }: { value: number; onChange: (value: number) => void; label: string }) {
  return (
    <div className="quantity" aria-label={label}>
      <button onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1} aria-label="Decrease quantity"><MinusIcon /></button>
      <span aria-live="polite">{value}</span>
      <button onClick={() => onChange(value + 1)} aria-label="Increase quantity"><PlusIcon /></button>
    </div>
  );
}

function CartPage({ lines, navigate, updateQuantity, removeFromCart }: { lines: CartLine[]; navigate: (route: Route) => void; updateQuantity: (id: string, quantity: number) => void; removeFromCart: (id: string) => void }) {
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const shipping = subtotal >= 150 || subtotal === 0 ? 0 : 12;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (lines.length === 0) {
    return (
      <section className="empty-state container">
        <div className="empty-state__icon"><BagIcon /></div>
        <p className="eyebrow">Your bag is waiting</p>
        <h1>Nothing here—yet.</h1>
        <p>Start with something useful, beautiful, or both.</p>
        <button className="button button--dark" onClick={() => navigate({ page: "shop" })}>Explore the collection</button>
      </section>
    );
  }

  return (
    <section className="cart container">
      <button className="text-link cart__back" onClick={() => navigate({ page: "shop" })}><BackIcon /> Continue shopping</button>
      <div className="cart__heading">
        <div>
          <p className="eyebrow">Your selection</p>
          <h1>Shopping bag</h1>
        </div>
        <p>{lines.reduce((sum, line) => sum + line.quantity, 0)} items</p>
      </div>
      <div className="cart__layout">
        <div className="cart-list">
          {lines.map(({ product, quantity }) => (
            <article className="cart-item" key={product.id}>
              <button className="cart-item__image" onClick={() => navigate({ page: "product", id: product.id })} aria-label={`View ${product.name}`}>
                <img src={product.image} alt={product.imageAlt} />
              </button>
              <div className="cart-item__content">
                <div>
                  <p className="product-card__brand">{product.brand}</p>
                  <h2>{product.name}</h2>
                  <p>{product.category}</p>
                </div>
                <div className="cart-item__actions">
                  <QuantityControl value={quantity} onChange={(next) => updateQuantity(product.id, next)} label={`${product.name} quantity`} />
                  <button className="remove-button" onClick={() => removeFromCart(product.id)} aria-label={`Remove ${product.name}`}><CloseIcon /> Remove</button>
                </div>
              </div>
              <strong className="cart-item__price">{currency.format(product.price * quantity)}</strong>
            </article>
          ))}
        </div>
        <aside className="order-summary">
          <p className="eyebrow">Order summary</p>
          <h2>Ready when you are.</h2>
          <dl>
            <div><dt>Subtotal</dt><dd>{currency.format(subtotal)}</dd></div>
            <div><dt>Shipping</dt><dd>{shipping === 0 ? "Free" : currency.format(shipping)}</dd></div>
            <div><dt>Estimated tax</dt><dd>{currency.format(tax)}</dd></div>
            <div className="order-summary__total"><dt>Total</dt><dd>{currency.format(total)}</dd></div>
          </dl>
          {shipping > 0 && <p className="shipping-note">Add {currency.format(150 - subtotal)} more for free shipping.</p>}
          <button className="button button--coral button--wide" onClick={() => window.alert("Demo checkout complete — no payment was processed.")}>Checkout</button>
          <p className="order-summary__fineprint">Secure demo checkout · No payment details required</p>
        </aside>
      </div>
    </section>
  );
}

function Footer({ navigate }: { navigate: (route: Route) => void }) {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <button className="brand brand--footer" onClick={() => navigate({ page: "shop" })}><span className="brand__mark">G</span><span>GlowShop</span></button>
          <p>Fewer, better things for everyday living.</p>
        </div>
        <div className="footer-meta"><span>Designed for everywhere</span><span>© 2026 GlowShop</span></div>
      </div>
    </footer>
  );
}

export default App;
