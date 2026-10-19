import { useEffect, useMemo, useState } from "react";
import "./solee.css";
import hero from "./img/hero.jpg";
import promo from "./img/promo.jpg";
import { CATEGORIES, PRODUCTS, STORE, catImage, find, ugx, type Gender, type Product } from "./data";

type Line = { id: string; size: number; qty: number };

function useLocal<T>(key: string, init: T) {
  const [v, setV] = useState<T>(init);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const s = localStorage.getItem(key); if (s) setV(JSON.parse(s)); } catch { /* ignore */ }
    setReady(true);
  }, [key]);
  useEffect(() => { if (ready) localStorage.setItem(key, JSON.stringify(v)); }, [key, v, ready]);
  return [v, setV] as const;
}

function useHash() {
  const [h, setH] = useState("#/");
  useEffect(() => {
    const f = () => { setH(window.location.hash || "#/"); window.scrollTo(0, 0); };
    f(); window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  const [path, q = ""] = h.slice(1).split("?");
  return { path, params: new URLSearchParams(q) };
}

const I = {
  search: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>,
  user: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>,
  heart: (on?: boolean) => <svg width="18" height="18" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" /></svg>,
  bag: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M5 8h14l-1 13H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>,
  menu: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 7h18M3 12h18M3 17h18" /></svg>,
};

export default function SoleeApp() {
  const { path, params } = useHash();
  const [cart, setCart] = useLocal<Line[]>("solee-cart", []);
  const [wish, setWish] = useLocal<string[]>("solee-wish", []);
  const [recent, setRecent] = useLocal<string[]>("solee-recent", []);
  const [menu, setMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toast, setToast] = useState("");

  const toggleWish = (id: string) => setWish((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
  const add = (id: string, size: number, qty = 1) => {
    setCart((c) => {
      const e = c.find((l) => l.id === id && l.size === size);
      return e ? c.map((l) => (l === e ? { ...l, qty: l.qty + qty } : l)) : [...c, { id, size, qty }];
    });
    setToast("Added to your bag"); setTimeout(() => setToast(""), 2000);
  };
  const count = cart.reduce((s, l) => s + l.qty, 0);
  const ctx = { wish, toggleWish, add };

  let page;
  if (path.startsWith("/p/")) page = <ProductPage id={path.slice(3)} {...ctx} setRecent={setRecent} recent={recent} />;
  else if (path === "/shop") page = <Shop params={params} {...ctx} />;
  else if (path === "/cart") page = <Cart cart={cart} setCart={setCart} />;
  else if (path === "/checkout") page = <Checkout cart={cart} />;
  else if (path === "/wishlist") page = <Wishlist {...ctx} />;
  else if (path === "/track") page = <Track />;
  else if (path.startsWith("/info/")) page = <Info k={path.slice(6)} />;
  else page = <Home {...ctx} />;

  return (
    <div className="solee">
      <div className="promo-bar">Delivery across Uganda · Pay on WhatsApp confirmation</div>
      <header className="nav">
        <div className="wrap nav-in">
          <button className="icon burger" aria-label="Menu" onClick={() => setMenu(!menu)}>{I.menu}</button>
          <a href="#/" className="logo">SOLEÉ</a>
          <nav className={"links" + (menu ? " open" : "")} onClick={() => setMenu(false)}>
            <a href="#/">Home</a>
            <a href="#/shop?g=women">Women's Shoes</a>
            <a href="#/shop?g=men">Men's Shoes</a>
            <a href="#/shop?new=1">New Arrivals</a>
            <a href="#/shop?best=1">Best Sellers</a>
            <a href="#/shop?sale=1" className="sale">Sale</a>
          </nav>
          <div className="icons">
            <button className="icon" aria-label="Search" onClick={() => setSearchOpen(!searchOpen)}>{I.search}</button>
            <a className="icon" aria-label="Track order" href="#/track">{I.user}</a>
            <a className="icon" aria-label="Wishlist" href="#/wishlist">{I.heart()}{wish.length > 0 && <span className="badge">{wish.length}</span>}</a>
            <a className="icon" aria-label="Shopping bag" href="#/cart">{I.bag}<span className="badge">{count}</span></a>
          </div>
        </div>
        {searchOpen && (
          <div className="search-pop">
            <form className="wrap" onSubmit={(e) => { e.preventDefault(); const q = new FormData(e.currentTarget).get("q"); window.location.hash = "/shop?q=" + encodeURIComponent(String(q)); setSearchOpen(false); }}>
              <input name="q" autoFocus placeholder="Search for loafers, sneakers, heels…" aria-label="Search products" />
            </form>
          </div>
        )}
      </header>
      <main>{page}</main>
      <Footer />
      {toast && <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 50 }} className="btn">{toast}</div>}
    </div>
  );
}

type Ctx = { wish: string[]; toggleWish: (id: string) => void; add: (id: string, size: number, q?: number) => void };

function Card({ p, wish, toggleWish }: { p: Product } & Ctx) {
  const on = wish.includes(p.id);
  return (
    <div className="card">
      <div className="ph">
        <a href={"#/p/" + p.id}><img src={p.img} alt={`${p.name} in ${p.colours[0]}`} loading="lazy" width={800} height={1000} /></a>
        {p.stock === 0 ? <span className="tag out">Sold out</span> : p.isNew && <span className="tag">New Arrival</span>}
        <button className={"heart" + (on ? " on" : "")} aria-label="Add to wishlist" onClick={() => toggleWish(p.id)}>{I.heart(on)}</button>
      </div>
      <a href={"#/p/" + p.id}><h3>{p.name}</h3></a>
      <div className="meta">{p.colours.join(", ")} · EU {p.sizes[0]}–{p.sizes[p.sizes.length - 1]}</div>
      <div className="price">{ugx(p.price)}</div>
      <a className="btn ghost" href={"#/p/" + p.id} style={{ width: "100%", padding: 11 }}>{p.stock === 0 ? "View" : "Add to Cart"}</a>
    </div>
  );
}

function Home(ctx: Ctx) {
  const news = PRODUCTS.filter((p) => p.isNew).slice(0, 8);
  const sig = PRODUCTS.filter((p) => p.signature).slice(0, 8);
  const best = PRODUCTS.filter((p) => p.best);
  return (
    <>
      <section className="hero">
        <img src={hero} alt="SOLEÉ women's and men's shoes displayed on travertine pedestals" width={1920} height={1088} />
        <div className="wrap"><div className="hero-txt">
          <div className="eyebrow">Step Different. Stand Out.</div>
          <h1 className="serif">Your Style Starts From the Ground Up.</h1>
          <p>Discover distinctive footwear designed to make every step unforgettable.</p>
          <div className="row"><a className="btn" href="#/shop?g=women">Shop Women</a><a className="btn ghost" href="#/shop?g=men">Shop Men</a></div>
        </div></div>
      </section>

      {(["women", "men"] as Gender[]).map((g) => (
        <section className="section" key={g} style={{ paddingBottom: g === "women" ? 0 : undefined }}>
          <div className="wrap">
            <div className="sec-head"><div><div className="eyebrow">Shop by category</div><h2 className="serif">{g === "women" ? "Women's Collection" : "Men's Collection"}</h2></div><a className="link-u" href={"#/shop?g=" + g}>View all</a></div>
            <div className="cats">
              {CATEGORIES[g].map((c) => (
                <a key={c} className="cat" href={`#/shop?g=${g}&cat=${encodeURIComponent(c)}`}>
                  <div><img src={catImage(g, c)} alt={`${g === "women" ? "Women's" : "Men's"} ${c}`} loading="lazy" /></div><span>{c}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="section" style={{ paddingTop: 0 }}><div className="wrap">
        <div className="sec-head"><div><div className="eyebrow">Just landed</div><h2 className="serif">New Arrivals</h2></div><a className="link-u" href="#/shop?new=1">Shop new</a></div>
        <div className="grid">{news.map((p) => <Card key={p.id} p={p} {...ctx} />)}</div>
      </div></section>

      <section className="section dark"><div className="wrap">
        <div className="sec-head"><div><div className="eyebrow">Hard to find elsewhere</div><h2 className="serif">The Signature Collection</h2></div></div>
        <div className="grid">{sig.map((p) => <Card key={p.id} p={p} {...ctx} />)}</div>
      </div></section>

      <section className="section"><div className="wrap">
        <div className="sec-head"><div><div className="eyebrow">Loved by customers</div><h2 className="serif">Best Sellers</h2></div><a className="link-u" href="#/shop?best=1">View all</a></div>
        <div className="grid">{best.map((p) => <Card key={p.id} p={p} {...ctx} />)}</div>
      </div></section>

      <section className="promo">
        <img src={promo} alt="Burgundy leather loafer on a cream pedestal" loading="lazy" />
        <div className="wrap"><div style={{ maxWidth: 520 }}>
          <div className="eyebrow">The edit</div>
          <h2 className="serif">Make Every Step Count.</h2>
          <p style={{ marginBottom: 26 }}>Discover your next favourite pair.</p>
          <a className="btn light" href="#/shop">Shop the Collection</a>
        </div></div>
      </section>

      <section className="section"><div className="wrap story">
        <img src={PRODUCTS[0].img} alt="Facet gold heel pump" loading="lazy" style={{ background: "var(--cream)" }} />
        <div>
          <div className="eyebrow">Our story</div>
          <h2 className="serif">Not Just Shoes. A Statement.</h2>
          <p style={{ color: "var(--muted)", fontSize: 17 }}>At SOLEÉ, we believe footwear is more than an accessory. It's a reflection of personality, confidence, and individuality. We bring together distinctive designs, everyday comfort, and accessible style so you can express yourself with every step.</p>
        </div>
      </div></section>

      <div className="wrap benefits">
        {[["Distinctive Styles", "M12 3l2.5 6H21l-5 4 2 7-6-4-6 4 2-7-5-4h6.5z"], ["Quality You Can Trust", "M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"], ["Convenient Shopping", "M5 8h14l-1 13H6L5 8Z"], ["Delivery Across Uganda", "M3 7h11v9H3zM14 10h4l3 3v3h-7z"]].map(([t, d]) => (
          <div key={t}><svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path d={d} /></svg>{t}</div>
        ))}
      </div>

      <section className="section news"><div className="wrap">
        <div className="eyebrow">Newsletter</div>
        <h2 className="serif" style={{ fontSize: 44, margin: "8px 0 0" }}>Be first to the new drops</h2>
        <p style={{ color: "var(--muted)" }}>New arrivals, promotions and exclusive offers — straight to your inbox.</p>
        <Newsletter />
      </div></section>
    </>
  );
}

function Newsletter() {
  const [done, setDone] = useState("");
  return done ? <p style={{ marginTop: 20 }}>{done}</p> : (
    <form onSubmit={(e) => { e.preventDefault(); const em = String(new FormData(e.currentTarget).get("email")); if (!/^\S+@\S+\.\S+$/.test(em)) return; window.open(`mailto:${STORE.email}?subject=Newsletter%20signup&body=${encodeURIComponent(em)}`); setDone("Thank you — your request has been prepared in your email app."); }}>
      <input type="email" name="email" required placeholder="Your email address" aria-label="Email" />
      <button className="btn">Subscribe</button>
    </form>
  );
}

function Shop({ params, ...ctx }: { params: URLSearchParams } & Ctx) {
  const [g, setG] = useState(params.get("g") ?? "");
  const [cat, setCat] = useState(params.get("cat") ?? "");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [max, setMax] = useState(300000);
  const [size, setSize] = useState("");
  const [colour, setColour] = useState("");
  const [onlyNew, setOnlyNew] = useState(params.get("new") === "1");
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState("newest");
  const best = params.get("best") === "1";
  const sale = params.get("sale") === "1";
  useEffect(() => { setG(params.get("g") ?? ""); setCat(params.get("cat") ?? ""); setQ(params.get("q") ?? ""); setOnlyNew(params.get("new") === "1"); }, [params.toString()]); // eslint-disable-line

  const colours = [...new Set(PRODUCTS.flatMap((p) => p.colours))];
  const list = useMemo(() => {
    let l = PRODUCTS.filter((p) =>
      (!g || p.gender === g) && (!cat || p.category === cat) && (!q || (p.name + p.category).toLowerCase().includes(q.toLowerCase())) &&
      p.price <= max && (!size || p.sizes.includes(+size)) && (!colour || p.colours.includes(colour)) &&
      (!onlyNew || p.isNew) && (!inStock || p.stock > 0) && (!best || p.best));
    if (sale) l = [];
    if (sort === "low") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "high") l = [...l].sort((a, b) => b.price - a.price);
    if (sort === "newest") l = [...l].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    return l;
  }, [g, cat, q, max, size, colour, onlyNew, inStock, sort, best, sale]);

  const title = sale ? "Sale" : best ? "Best Sellers" : onlyNew ? "New Arrivals" : g === "women" ? "Women's Shoes" : g === "men" ? "Men's Shoes" : "All Shoes";
  return (
    <div className="wrap">
      <h1 className="serif page-title">{cat || title}</h1>
      <div className="shop">
        <aside className="filters">
          <label>Search</label><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Product name" />
          <label>Shop for</label>
          <select value={g} onChange={(e) => { setG(e.target.value); setCat(""); }}><option value="">Women & Men</option><option value="women">Women</option><option value="men">Men</option></select>
          <label>Category</label>
          <select value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All categories</option>{(g ? CATEGORIES[g as Gender] : [...CATEGORIES.women, ...CATEGORIES.men]).map((c, i) => <option key={c + i}>{c}</option>)}</select>
          <label>Max price: {ugx(max)}</label><input type="range" min={100000} max={300000} step={10000} value={max} onChange={(e) => setMax(+e.target.value)} />
          <label>Size (EU)</label>
          <select value={size} onChange={(e) => setSize(e.target.value)}><option value="">Any size</option>{[36, 37, 38, 39, 40, 41, 42, 43, 44, 45].map((s) => <option key={s}>{s}</option>)}</select>
          <label>Colour</label>
          <select value={colour} onChange={(e) => setColour(e.target.value)}><option value="">Any colour</option>{colours.map((c) => <option key={c}>{c}</option>)}</select>
          <label className="chk"><input type="checkbox" checked={onlyNew} onChange={(e) => setOnlyNew(e.target.checked)} /> New arrivals only</label>
          <label className="chk"><input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} /> In stock only</label>
          <label>Sort by</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="newest">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select>
        </aside>
        <div>
          <p className="meta" style={{ marginTop: 0 }}>{list.length} {list.length === 1 ? "style" : "styles"}</p>
          {list.length ? <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(46%, 230px), 1fr))" }}>{list.map((p) => <Card key={p.id} p={p} {...ctx} />)}</div>
            : <div className="notice">{sale ? "No sale items right now — check back soon or browse new arrivals." : "No shoes match these filters. Try widening your search."}</div>}
        </div>
      </div>
    </div>
  );
}

function ProductPage({ id, recent, setRecent, ...ctx }: { id: string; recent: string[]; setRecent: (f: (r: string[]) => string[]) => void } & Ctx) {
  const p = find(id);
  const [size, setSize] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState("");
  const [view, setView] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => { if (p) setRecent((r) => [p.id, ...r.filter((x) => x !== p.id)].slice(0, 8)); setSize(null); setQty(1); setView(0); }, [id]); // eslint-disable-line
  useEffect(() => { if (p) document.title = `${p.name} — SOLEÉ Footwear`; }, [p]);
  if (!p) return <div className="wrap section"><h1 className="serif">Product not found</h1><a className="btn" href="#/shop">Back to shop</a></div>;

  const views = [{ t: "Three-quarter", s: {} }, { t: "Side", s: { transform: "scaleX(-1)" } }, { t: "Detail", s: { transform: "scale(1.6)", transformOrigin: "60% 60%" } }];
  const related = PRODUCTS.filter((x) => x.gender === p.gender && x.id !== p.id).slice(0, 4);
  const recents = recent.filter((r) => r !== p.id).map(find).filter(Boolean).slice(0, 4) as Product[];
  const go = (buy: boolean) => {
    if (!size) return setErr("Please select a size first.");
    setErr(""); ctx.add(p.id, size, qty); if (buy) window.location.hash = "/checkout";
  };
  return (
    <div className="wrap">
      <div className="pdp">
        <div>
          <div className="zoom" onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }} onMouseLeave={() => setZoom(null)}>
            <img src={p.img} alt={`${p.name} – ${views[view]!.t} view`} style={zoom ? { transform: `${view === 1 ? "scaleX(-1) " : ""}scale(2)`, transformOrigin: `${zoom.x}% ${zoom.y}%` } : views[view]!.s} />
          </div>
          <div className="thumbs">{views.map((v, i) => (
            <button key={v.t} className={i === view ? "on" : ""} onClick={() => setView(i)} aria-label={v.t + " view"} style={{ overflow: "hidden" }}><img src={p.img} alt="" style={v.s} /></button>
          ))}</div>
        </div>
        <div>
          <div className="eyebrow">{p.gender === "women" ? "Women" : "Men"} · {p.category}</div>
          <h1 className="serif" style={{ fontSize: 46, lineHeight: 1.05, margin: "10px 0" }}>{p.name}</h1>
          <div style={{ fontSize: 20 }}>{ugx(p.price)}</div>
          <p style={{ color: "var(--muted)" }}>{p.description}</p>
          <p className="meta">Colour: <b>{p.colours.join(", ")}</b></p>
          <p className="meta" style={{ color: p.stock === 0 ? "var(--wine)" : undefined }}>{p.stock === 0 ? "Sold out" : p.stock <= 4 ? `Only ${p.stock} left in stock` : "In stock"}</p>
          <div className="eyebrow" style={{ margin: "20px 0 8px" }}>Select size (EU)</div>
          <div className="sizes">{p.sizes.map((s) => <button key={s} className={size === s ? "on" : ""} onClick={() => { setSize(s); setErr(""); }}>{s}</button>)}</div>
          {err && <p className="err">{err}</p>}
          <div className="row" style={{ margin: "22px 0", alignItems: "stretch" }}>
            <div className="qty"><button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease">−</button><span>{qty}</span><button onClick={() => setQty(Math.min(p.stock || 1, qty + 1))} aria-label="Increase">+</button></div>
            <button className="btn" disabled={p.stock === 0} onClick={() => go(false)} style={{ flex: 1 }}>Add to Cart</button>
          </div>
          <button className="btn ghost" disabled={p.stock === 0} onClick={() => go(true)} style={{ width: "100%", marginBottom: 10 }}>Buy Now</button>
          <button className="btn ghost" onClick={() => ctx.toggleWish(p.id)} style={{ width: "100%", marginBottom: 24 }}>{ctx.wish.includes(p.id) ? "Saved to wishlist" : "Add to wishlist"}</button>
          <details open><summary>Material & details</summary><p>{p.material}</p></details>
          <details><summary>Size guide</summary>
            <table style={{ width: "100%", fontSize: 13 }}><tbody><tr><td>EU</td>{p.sizes.map((s) => <td key={s}>{s}</td>)}</tr><tr><td>UK</td>{p.sizes.map((s) => <td key={s}>{s - 33}</td>)}</tr><tr><td>Foot (cm)</td>{p.sizes.map((s) => <td key={s}>{((s + 2) * 0.667 - 1.5).toFixed(1)}</td>)}</tr></tbody></table>
            <p className="meta">Between sizes? Message us on WhatsApp and we'll help.</p></details>
          <details><summary>Delivery</summary><p>{STORE.delivery.map((d) => `${d.label}: ${d.fee ? ugx(d.fee) : "Free"}`).join(" · ")}. Delivery time is confirmed when we receive your order.</p></details>
          <details><summary>Returns & exchanges</summary><p>Unworn shoes in original packaging can be exchanged. See our <a className="link-u" href="#/info/returns">returns policy</a>.</p></details>
        </div>
      </div>
      <section style={{ paddingBottom: 60 }}><h2 className="serif" style={{ fontSize: 36 }}>You may also like</h2><div className="grid">{related.map((x) => <Card key={x.id} p={x} {...ctx} />)}</div></section>
      {recents.length > 0 && <section style={{ paddingBottom: 80 }}><h2 className="serif" style={{ fontSize: 36 }}>Recently viewed</h2><div className="grid">{recents.map((x) => <Card key={x.id} p={x} {...ctx} />)}</div></section>}
    </div>
  );
}

function useTotals(cart: Line[], code: string, deliveryId: string) {
  const subtotal = cart.reduce((s, l) => s + (find(l.id)?.price ?? 0) * l.qty, 0);
  const rate = STORE.discounts[code.trim().toUpperCase()] ?? 0;
  const discount = Math.round(subtotal * rate);
  const fee = cart.length ? STORE.delivery.find((d) => d.id === deliveryId)?.fee ?? 0 : 0;
  return { subtotal, discount, fee, total: subtotal - discount + fee, valid: rate > 0 };
}

function Summary({ t, code }: { t: ReturnType<typeof useTotals>; code: string }) {
  return (<>
    <div className="l"><span>Subtotal</span><span>{ugx(t.subtotal)}</span></div>
    {t.discount > 0 && <div className="l"><span>Discount ({code.toUpperCase()})</span><span>−{ugx(t.discount)}</span></div>}
    <div className="l"><span>Delivery</span><span>{t.fee ? ugx(t.fee) : "Free"}</span></div>
    <div className="l t"><span>Total</span><span>{ugx(t.total)}</span></div>
  </>);
}

function Cart({ cart, setCart }: { cart: Line[]; setCart: (f: (c: Line[]) => Line[]) => void }) {
  const [code, setCode] = useLocal("solee-code", "");
  const [del, setDel] = useLocal("solee-del", "kla");
  const t = useTotals(cart, code, del);
  const upd = (i: number, patch: Partial<Line>) => setCart((c) => c.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  return (
    <div className="wrap">
      <h1 className="serif page-title">Your Bag</h1>
      {cart.length === 0 ? <div className="section"><p>Your bag is empty.</p><a className="btn" href="#/shop">Continue shopping</a></div> : (
        <div className="two">
          <div>{cart.map((l, i) => { const p = find(l.id)!; return (
            <div className="cart-row" key={l.id + l.size}>
              <a href={"#/p/" + p.id}><img src={p.img} alt={p.name} /></a>
              <div>
                <b>{p.name}</b><div className="meta">{p.colours[0]} · {ugx(p.price)}</div>
                <div className="row" style={{ marginTop: 10 }}>
                  <select value={l.size} onChange={(e) => upd(i, { size: +e.target.value })} style={{ width: 90 }} aria-label="Size">{p.sizes.map((s) => <option key={s}>{s}</option>)}</select>
                  <div className="qty"><button onClick={() => upd(i, { qty: Math.max(1, l.qty - 1) })}>−</button><span>{l.qty}</span><button onClick={() => upd(i, { qty: Math.min(p.stock, l.qty + 1) })}>+</button></div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}><div>{ugx(p.price * l.qty)}</div><button className="link-u" style={{ background: "none", border: 0, marginTop: 10 }} onClick={() => setCart((c) => c.filter((_, j) => j !== i))}>Remove</button></div>
            </div>); })}
            <a className="link-u" href="#/shop" style={{ display: "inline-block", marginTop: 20 }}>Continue shopping</a>
          </div>
          <div className="summary">
            <h3 className="serif" style={{ fontSize: 28, marginTop: 0 }}>Order summary</h3>
            <label className="eyebrow">Delivery area</label>
            <select value={del} onChange={(e) => setDel(e.target.value)} style={{ margin: "6px 0 14px" }}>{STORE.delivery.map((d) => <option key={d.id} value={d.id}>{d.label} — {d.fee ? ugx(d.fee) : "Free"}</option>)}</select>
            <label className="eyebrow">Discount code</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code" style={{ margin: "6px 0 4px" }} />
            {code && <p className={t.valid ? "meta" : "err"}>{t.valid ? "Code applied" : "This code isn't valid"}</p>}
            <Summary t={t} code={code} />
            <a className="btn" href="#/checkout" style={{ width: "100%", marginTop: 18 }}>Proceed to checkout</a>
          </div>
        </div>
      )}
    </div>
  );
}

function Checkout({ cart }: { cart: Line[] }) {
  const [code] = useLocal("solee-code", "");
  const [del, setDel] = useLocal("solee-del", "kla");
  const [pay, setPay] = useState("MTN Mobile Money");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const t = useTotals(cart, code, del);
  if (!cart.length) return <div className="wrap section"><h1 className="serif">Your bag is empty</h1><a className="btn" href="#/shop">Shop now</a></div>;

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as { name: string; phone: string; email: string; address: string; notes: string };
    const er: Record<string, string> = {};
    if (f.name.trim().length < 2) er.name = "Please enter your full name.";
    if (!/^(\+?256|0)7\d{8}$/.test(f.phone.replace(/\s/g, ""))) er.phone = "Enter a valid Ugandan phone number, e.g. 0772 123 456.";
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) er.email = "Enter a valid email or leave it blank.";
    if (f.address.trim().length < 5) er.address = "Please enter your delivery address.";
    setErrors(er);
    if (Object.keys(er).length) return;
    const ref = "SL" + Date.now().toString().slice(-6);
    const items = cart.map((l) => { const p = find(l.id)!; return `• ${p.name} (EU ${l.size}) x${l.qty} — ${ugx(p.price * l.qty)}`; }).join("\n");
    const msg = `Hello SOLEÉ, I'd like to place an order.\nRef: ${ref}\n\n${items}\n\nSubtotal: ${ugx(t.subtotal)}${t.discount ? `\nDiscount: −${ugx(t.discount)}` : ""}\nDelivery (${STORE.delivery.find((d) => d.id === del)?.label}): ${ugx(t.fee)}\nTOTAL: ${ugx(t.total)}\n\nName: ${f.name}\nPhone: ${f.phone}\nEmail: ${f.email || "-"}\nAddress: ${f.address}\nInstructions: ${f.notes || "-"}\nPreferred payment: ${pay}`;
    window.open(`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  };
  const E = ({ k }: { k: string }) => (errors[k] ? <span className="err">{errors[k]}</span> : null);
  return (
    <div className="wrap">
      <h1 className="serif page-title">Checkout</h1>
      <div className="two">
        <form className="form-g" onSubmit={submit} noValidate>
          <input name="name" placeholder="Full name *" maxLength={80} /><E k="name" />
          <input name="phone" placeholder="Phone number * (e.g. 0772 123 456)" maxLength={16} /><E k="phone" />
          <input name="email" type="email" placeholder="Email (optional)" maxLength={120} /><E k="email" />
          <select value={del} onChange={(e) => setDel(e.target.value)}>{STORE.delivery.map((d) => <option key={d.id} value={d.id}>{d.label} — {d.fee ? ugx(d.fee) : "Free"}</option>)}</select>
          <input name="address" placeholder="Delivery address *" maxLength={200} /><E k="address" />
          <textarea name="notes" placeholder="Delivery instructions (optional)" rows={3} maxLength={300} />
          <div className="eyebrow" style={{ marginTop: 10 }}>Preferred payment</div>
          {["MTN Mobile Money", "Airtel Money", "Card payment"].map((m) => (
            <label key={m} className="chk"><input type="radio" name="pay" checked={pay === m} onChange={() => setPay(m)} /> {m}</label>
          ))}
          <div className="notice">Your order is sent to us on WhatsApp. We confirm stock and delivery time, then send you secure payment instructions. No payment is taken on this page.</div>
          <button className="btn">Send order on WhatsApp · {ugx(t.total)}</button>
        </form>
        <div className="summary">
          <h3 className="serif" style={{ fontSize: 28, marginTop: 0 }}>Your order</h3>
          {cart.map((l) => { const p = find(l.id)!; return <div className="l" key={l.id + l.size}><span>{p.name} · EU {l.size} × {l.qty}</span><span>{ugx(p.price * l.qty)}</span></div>; })}
          <Summary t={t} code={code} />
        </div>
      </div>
    </div>
  );
}

function Wishlist(ctx: Ctx) {
  const items = ctx.wish.map(find).filter(Boolean) as Product[];
  return <div className="wrap" style={{ paddingBottom: 80 }}><h1 className="serif page-title">Wishlist</h1>
    {items.length ? <div className="grid" style={{ marginTop: 30 }}>{items.map((p) => <Card key={p.id} p={p} {...ctx} />)}</div> : <p>Nothing saved yet. Tap the heart on any shoe to save it.</p>}</div>;
}

function Track() {
  return <div className="wrap" style={{ maxWidth: 560, paddingBottom: 80 }}>
    <h1 className="serif page-title">Track your order</h1>
    <p style={{ color: "var(--muted)" }}>Enter the order reference from your WhatsApp confirmation and we'll reply with the latest status.</p>
    <form className="form-g" onSubmit={(e) => { e.preventDefault(); const r = String(new FormData(e.currentTarget).get("ref")).trim(); if (r) window.open(`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent("Hello SOLEÉ, what is the status of order " + r + "?")}`, "_blank"); }}>
      <input name="ref" placeholder="Order reference, e.g. SL123456" required maxLength={20} />
      <button className="btn">Check status</button>
    </form>
  </div>;
}

const INFO: Record<string, [string, string]> = {
  delivery: ["Delivery Information", "We deliver within Kampala and to other parts of Uganda. Delivery fees are shown at checkout, and the delivery time is confirmed with you when we receive your order."],
  returns: ["Returns & Exchanges", "Unworn shoes in their original packaging may be exchanged for a different size or style. Contact us on WhatsApp with your order reference to arrange an exchange. Orders can be cancelled before they are dispatched."],
  privacy: ["Privacy Policy", "We only use your name, phone, email and address to process and deliver your order. We never store payment details on this website and never sell your information."],
  terms: ["Terms & Conditions", "Prices are in Ugandan shillings (UGX). Orders are confirmed once stock and payment are verified. Product colours may vary slightly depending on your screen."],
};
function Info({ k }: { k: string }) {
  const [t, b] = INFO[k] ?? ["Not found", ""];
  return <div className="wrap" style={{ maxWidth: 720, paddingBottom: 80 }}><h1 className="serif page-title">{t}</h1><p style={{ fontSize: 17, color: "var(--muted)" }}>{b}</p></div>;
}

function Footer() {
  return (
    <footer className="foot"><div className="wrap">
      <div className="foot-g">
        <div><div className="logo">SOLEÉ</div><p>Step Different. Stand Out.<br />Distinctive footwear for women and men in Uganda.</p></div>
        <div><h4>Shop</h4><ul><li><a href="#/shop?g=women">Women</a></li><li><a href="#/shop?g=men">Men</a></li><li><a href="#/shop?new=1">New Arrivals</a></li><li><a href="#/shop?best=1">Best Sellers</a></li></ul></div>
        <div><h4>Help</h4><ul><li><a href="#/info/delivery">Delivery</a></li><li><a href="#/info/returns">Returns policy</a></li><li><a href="#/track">Track order</a></li><li><a href="#/info/privacy">Privacy policy</a></li><li><a href="#/info/terms">Terms & conditions</a></li></ul></div>
        <div><h4>Contact</h4><ul><li><a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp support</a></li><li>{STORE.phone}</li><li><a href={`mailto:${STORE.email}`}>{STORE.email}</a></li><li><a href={STORE.instagram} target="_blank" rel="noreferrer">Instagram</a> · <a href={STORE.tiktok} target="_blank" rel="noreferrer">TikTok</a></li></ul></div>
      </div>
      <div className="copy">© {new Date().getFullYear()} SOLEÉ Footwear. All rights reserved.</div>
    </div></footer>
  );
}
