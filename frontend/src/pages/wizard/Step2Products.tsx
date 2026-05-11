import { useState } from "react";
import { useWizard } from "@/contexts/WizardContext";
import type { Product } from "@/types";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";

export default function Step2Products() {
  const { data, updateData, setStep } = useWizard();
  const [products, setProducts] = useState<Product[]>(
    data.products.length > 0 ? data.products : [{ name: "", price: 0 }]
  );
  const [error, setError] = useState("");

  const addProduct = () => setProducts([...products, { name: "", price: 0 }]);

  const removeProduct = (i: number) => {
    if (products.length === 1) return;
    setProducts(products.filter((_, idx) => idx !== i));
  };

  const updateProduct = (i: number, field: keyof Product, value: string | number) => {
    setProducts(products.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  };

  const handleNext = () => {
    const valid = products.filter((p) => p.name.trim() && p.price > 0);
    if (valid.length === 0) {
      setError("Add at least one product or service with a name and price.");
      return;
    }
    updateData({ products: valid });
    setStep(3);
  };

  return (
    <div className="space-y-10">
      {/* ── Heading ─────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold text-foreground">Input your product name!</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          List your key offerings with their prices (IDR). You can add multiple products.
        </p>
      </div>

      {/* ── Product rows ────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {products.map((product, i) => (
          <div key={i} className="group flex items-center gap-2">
            {/* Name */}
            <div className="flex flex-1 items-center gap-2 rounded-2xl border border-card-border bg-white px-4 py-3 shadow-sm focus-within:border-foreground focus-within:ring-1 focus-within:ring-foreground transition-all">
              <input
                type="text"
                placeholder={`Product ${i + 1} name — e.g. Signature Latte`}
                value={product.name}
                onChange={(e) => updateProduct(i, "name", e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
              />
              <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/30" />
            </div>

            {/* Price */}
            <div className="flex w-32 items-center rounded-2xl border border-card-border bg-white px-3 py-3 shadow-sm focus-within:border-foreground focus-within:ring-1 focus-within:ring-foreground transition-all">
              <span className="mr-1.5 text-xs text-muted-foreground">Rp</span>
              <input
                type="number"
                placeholder="35000"
                value={product.price || ""}
                onChange={(e) => updateProduct(i, "price", Number(e.target.value))}
                min={0}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Remove */}
            <button
              onClick={() => removeProduct(i)}
              disabled={products.length === 1}
              className="rounded-full p-2 text-muted-foreground/40 transition-colors hover:text-destructive disabled:opacity-0"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* ── Add row ─────────────────────────────────────────────────────── */}
      <button
        onClick={addProduct}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-card-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
      >
        <Plus className="h-4 w-4" />
        Add another item
      </button>

      {error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(1)}
          className="flex items-center gap-2 rounded-full border border-card-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 rounded-full bg-foreground px-7 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
