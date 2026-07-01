"use client";

import { use, useState } from "react";
import { ShoppingCart, Plus, Minus, Trash2, X, ShoppingBag } from "lucide-react";
import { trpc } from "@/lib/trpc";

type ProductCategory = "apparel" | "accessories" | "supplements" | "equipment";
type Category = "all" | ProductCategory;

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  category: ProductCategory;
  colorName: string | null;
  image: string | null;
  inStock: boolean;
}

const CATEGORY_LABELS: Record<Category, string> = {
  all: "Todos",
  apparel: "Vestuário",
  accessories: "Acessórios",
  supplements: "Suplementos",
  equipment: "Equipamento",
};

function formatPrice(price: number, currency: string): string {
  return currency === "EUR" || !currency ? `${price.toFixed(2)}€` : `${price.toFixed(2)} ${currency}`;
}

interface CartItem {
  product: Product;
  quantity: number;
}

function ProductTile({ product, className }: { product: Product; className?: string }) {
  if (product.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={product.image}
        alt={product.name}
        className={`${className ?? ""} object-cover`}
      />
    );
  }
  return (
    <div className={`${className ?? ""} bg-vytal-bg3 flex items-center justify-center`}>
      <ShoppingBag className="h-1/3 w-1/3 opacity-30" />
    </div>
  );
}

function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
}) {
  return (
    <div className="group flex flex-col rounded-xl border border-vytal-border bg-vytal-card overflow-hidden transition-all hover:border-vytal-green/30 hover:shadow-sm">
      {/* Image / placeholder tile */}
      <div className="relative aspect-square w-full">
        <ProductTile product={product} className="absolute inset-0 h-full w-full" />
        <span className="absolute bottom-2 left-2 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
          {CATEGORY_LABELS[product.category] ?? product.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold text-vytal-text">{product.name}</h3>
        {product.colorName && (
          <p className="mt-0.5 text-[11px] text-vytal-muted">{product.colorName}</p>
        )}
        <p className="mt-1 flex-1 text-xs leading-relaxed text-vytal-muted">{product.description ?? ""}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-black text-vytal-text">{formatPrice(product.price, product.currency)}</span>
          <button
            onClick={() => onAddToCart(product)}
            className="flex items-center gap-1.5 rounded-lg bg-vytal-green px-3 py-1.5 text-xs font-semibold text-vytal-bg transition-all hover:bg-vytal-green/90 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}

function CartSidebar({
  cart,
  onUpdateQty,
  onRemove,
  onClose,
}: {
  cart: CartItem[];
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const currency = cart[0]?.product.currency ?? "EUR";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button className="flex-1 bg-black/50" onClick={onClose} />
      <div className="flex h-full w-full max-w-sm flex-col border-l border-vytal-border bg-vytal-bg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-vytal-border px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-vytal-green" />
            <span className="font-bold text-vytal-text">Carrinho</span>
            {count > 0 && (
              <span className="rounded-full bg-vytal-green px-2 py-0.5 text-xs font-bold text-vytal-bg">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-vytal-muted hover:bg-vytal-bg3 hover:text-vytal-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <ShoppingCart className="h-12 w-12 text-vytal-muted/20" />
              <p className="mt-3 text-sm text-vytal-muted">O carrinho está vazio</p>
            </div>
          ) : (
            <div className="space-y-px">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 border-b border-vytal-border/50 px-5 py-4">
                  <ProductTile product={item.product} className="h-12 w-12 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-vytal-text">{item.product.name}</p>
                    <p className="text-xs text-vytal-muted">{formatPrice(item.product.price * item.quantity, item.product.currency)}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onUpdateQty(item.product.id, -1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-vytal-border text-vytal-muted hover:border-vytal-green/30 hover:text-vytal-green"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-vytal-text">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQty(item.product.id, 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-vytal-border text-vytal-muted hover:border-vytal-green/30 hover:text-vytal-green"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onRemove(item.product.id)}
                      className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg text-vytal-muted/50 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-vytal-border p-5">
            <div className="mb-4 space-y-1.5">
              <div className="flex justify-between text-sm text-vytal-muted">
                <span>Subtotal</span>
                <span>{formatPrice(total, currency)}</span>
              </div>
              <div className="flex justify-between text-sm text-vytal-muted">
                <span>Envio</span>
                <span className="text-vytal-green">Grátis</span>
              </div>
              <div className="flex justify-between border-t border-vytal-border/50 pt-2 text-base font-bold text-vytal-text">
                <span>Total</span>
                <span>{formatPrice(total, currency)}</span>
              </div>
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-vytal-green py-3 text-sm font-bold text-vytal-bg hover:bg-vytal-green/90">
              <ShoppingCart className="h-4 w-4" />
              Finalizar Compra
            </button>
            <p className="mt-2 text-center text-[10px] text-vytal-muted">
              Pagamento seguro · MBWay · Cartão · Transferência
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const productsQuery = trpc.public.products.useQuery({ slug });
  const siteQuery = trpc.public.site.useQuery({ slug });
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const products: Product[] = productsQuery.data ?? [];
  const orgName = siteQuery.data?.name ?? "";

  const categories: Category[] = ["all", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function handleAddToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function handleUpdateQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function handleRemove(id: string) {
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  }

  return (
    <>
      {cartOpen && (
        <CartSidebar
          cart={cart}
          onUpdateQty={handleUpdateQty}
          onRemove={handleRemove}
          onClose={() => setCartOpen(false)}
        />
      )}

      {/* Header */}
      <section className="border-b border-vytal-border bg-vytal-bg2">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vytal-green/10">
                <ShoppingBag className="h-5 w-5 text-vytal-green" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-vytal-text">Loja</h1>
                <p className="text-sm text-vytal-muted">{orgName ? `${orgName} · ` : ""}{products.length} produtos</p>
              </div>
            </div>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 rounded-xl border border-vytal-border bg-vytal-card px-4 py-2.5 text-sm font-medium text-vytal-text transition-colors hover:border-vytal-green/30 hover:text-vytal-green"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Carrinho</span>
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-vytal-green text-[10px] font-bold text-vytal-bg">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Category filter */}
      <section className="sticky top-[113px] z-10 border-b border-vytal-border bg-vytal-bg2/95 backdrop-blur-sm md:top-[57px]">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex gap-1 overflow-x-auto py-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-vytal-green/10 text-vytal-green"
                    : "text-vytal-muted hover:text-vytal-text"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="mx-auto max-w-5xl px-6 py-8">
        {productsQuery.isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-vytal-border border-t-vytal-green" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-vytal-border bg-vytal-card">
            <ShoppingBag className="h-10 w-10 text-vytal-muted/30" />
            <p className="mt-3 text-sm text-vytal-muted">Sem produtos nesta categoria</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </section>

      {/* Floating cart bar (mobile) */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
          <button
            onClick={() => setCartOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl bg-vytal-green px-5 py-3.5 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-vytal-bg" />
              <span className="text-sm font-bold text-vytal-bg">{cartCount} item{cartCount !== 1 ? "s" : ""}</span>
            </div>
            <span className="text-sm font-bold text-vytal-bg">
              {formatPrice(cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0), cart[0]?.product.currency ?? "EUR")}
            </span>
          </button>
        </div>
      )}
    </>
  );
}
