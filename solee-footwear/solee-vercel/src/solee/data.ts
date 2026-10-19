import p1 from "./img/p1.jpg";
import p2 from "./img/p2.jpg";
import p3 from "./img/p3.jpg";
import p4 from "./img/p4.jpg";
import p5 from "./img/p5.jpg";
import p6 from "./img/p6.jpg";
import p7 from "./img/p7.jpg";
import p8 from "./img/p8.jpg";
import p9 from "./img/p9.jpg";
import p10 from "./img/p10.jpg";
import p11 from "./img/p11.jpg";
import p12 from "./img/p12.jpg";

// ---- Store settings: edit these to configure the shop ----
export const STORE = {
  whatsapp: "256700000000", // replace with the real WhatsApp number (no +)
  phone: "+256 700 000 000",
  email: "hello@soleefootwear.ug",
  instagram: "https://instagram.com/",
  tiktok: "https://tiktok.com/",
  delivery: [
    { id: "kla", label: "Kampala", fee: 10000, eta: "To be confirmed on order" },
    { id: "upc", label: "Other parts of Uganda", fee: 20000, eta: "To be confirmed on order" },
    { id: "pick", label: "Store pickup", fee: 0, eta: "Arrange via WhatsApp" },
  ],
  discounts: { SOLEE10: 0.1 } as Record<string, number>,
};

export type Gender = "women" | "men";
export type Product = {
  id: string;
  name: string;
  gender: Gender;
  category: string;
  price: number;
  img: string;
  colours: string[];
  sizes: number[];
  stock: number;
  isNew?: boolean;
  best?: boolean;
  signature?: boolean;
  material: string;
  description: string;
};

export const CATEGORIES: Record<Gender, string[]> = {
  women: ["Statement Heels", "Flats & Ballet", "Fashion Sneakers", "Loafers & Mules", "Sandals & Slides", "Boots"],
  men: ["Premium Sneakers", "Leather Loafers", "Formal Dress Shoes", "Modern Casual", "Designer Slides", "Boots"],
};

const W = [36, 37, 38, 39, 40, 41];
const M = [40, 41, 42, 43, 44, 45];

export const PRODUCTS: Product[] = [
  { id: "facet-pump", name: "Facet Gold Heel Pump", gender: "women", category: "Statement Heels", price: 285000, img: p1, colours: ["Black Patent"], sizes: W, stock: 6, isNew: true, signature: true, best: true, material: "Patent leather upper, sculpted metallic block heel, leather lining.", description: "A pointed pump balanced on a faceted gold heel that catches the light with every step." },
  { id: "duet-loafer", name: "Duet Metallic Loafer", gender: "women", category: "Loafers & Mules", price: 210000, img: p2, colours: ["Silver / Black"], sizes: W, stock: 9, isNew: true, signature: true, material: "Metallic and smooth leather, stacked rubber heel.", description: "A two-tone penny loafer that turns a classic into a conversation piece." },
  { id: "bow-flat", name: "Bordeaux Chunky Ballet", gender: "women", category: "Flats & Ballet", price: 175000, img: p3, colours: ["Burgundy"], sizes: W, stock: 4, isNew: true, signature: true, best: true, material: "Satin upper, grosgrain bow strap, lug rubber sole.", description: "The ballet flat reimagined on a confident chunky sole with a soft satin bow." },
  { id: "block-runner", name: "Block Colour Runner", gender: "women", category: "Fashion Sneakers", price: 195000, img: p4, colours: ["Taupe / Burgundy"], sizes: W, stock: 12, isNew: true, signature: true, material: "Suede panels, cushioned EVA midsole.", description: "Artistic colour blocking in suede for everyday streets." },
  { id: "cross-sandal", name: "Crossover Strap Sandal", gender: "women", category: "Sandals & Slides", price: 165000, img: p5, colours: ["Tan"], sizes: W, stock: 8, signature: true, best: true, material: "Padded leather straps, gold-tone buckle, block heel.", description: "Soft crossing straps and a comfortable block heel for long days." },
  { id: "weave-mule", name: "Woven Kitten Mule", gender: "women", category: "Loafers & Mules", price: 180000, img: p6, colours: ["Cream"], sizes: W, stock: 5, isNew: true, material: "Hand-woven leather upper, kitten heel.", description: "Pointed, woven and effortlessly elegant." },
  { id: "flare-boot", name: "Flare Heel Ankle Boot", gender: "women", category: "Boots", price: 295000, img: p7, colours: ["Chocolate Suede"], sizes: W, stock: 3, material: "Suede upper, side zip, sculpted flared heel.", description: "A square-toe ankle boot with a flared heel for evenings out." },
  { id: "croc-tassel", name: "Croc Tassel Loafer", gender: "men", category: "Leather Loafers", price: 260000, img: p8, colours: ["Dark Brown"], sizes: M, stock: 7, isNew: true, signature: true, best: true, material: "Croc-embossed leather, leather sole.", description: "Textured leather and tassels for the man who notices details." },
  { id: "pure-court", name: "Pure Court Sneaker", gender: "men", category: "Premium Sneakers", price: 220000, img: p9, colours: ["White / Gum"], sizes: M, stock: 15, isNew: true, signature: true, best: true, material: "Full-grain leather, gum rubber cupsole.", description: "Minimal, premium and made to go with everything." },
  { id: "edge-derby", name: "Edge Square-Toe Derby", gender: "men", category: "Formal Dress Shoes", price: 275000, img: p10, colours: ["Black"], sizes: M, stock: 6, signature: true, material: "Polished calf leather, stacked heel.", description: "A modern square toe that sharpens any suit." },
  { id: "cloud-slide", name: "Quilted Cloud Slide", gender: "men", category: "Designer Slides", price: 120000, img: p11, colours: ["Black / Cream"], sizes: M, stock: 20, isNew: true, best: true, material: "Padded leather strap, sculpted EVA sole.", description: "Quilted comfort on a bold sculpted sole." },
  { id: "lug-chelsea", name: "Lug Sole Chelsea Boot", gender: "men", category: "Boots", price: 290000, img: p12, colours: ["Tan"], sizes: M, stock: 0, material: "Leather upper, elastic gussets, lug sole.", description: "A rugged Chelsea with a chunky grip sole." },
];

export const ugx = (n: number) => "UGX " + n.toLocaleString("en-UG");
export const find = (id: string) => PRODUCTS.find((p) => p.id === id);
export const catImage = (g: Gender, c: string) =>
  (PRODUCTS.find((p) => p.gender === g && p.category === c) ?? PRODUCTS.find((p) => p.gender === g)!).img;
