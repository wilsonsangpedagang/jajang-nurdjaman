import { useState } from "react";
import { useWizard } from "@/contexts/WizardContext";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, ShoppingBag, Plus, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

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
    setProducts(products.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  };

  const handleNext = () => {
    const valid = products.filter((p) => p.name.trim() && p.price > 0);
    if (valid.length === 0) { setError("Add at least one product or service with a name and price."); return; }
    updateData({ products: valid });
    setStep(3);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <ShoppingBag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Product & Service Catalog</CardTitle>
            <CardDescription>List your key offerings with indicative prices (IDR)</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {products.map((product, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor={`prod-name-${i}`}>{i === 0 ? "Product / Service Name" : ""}</Label>
                <Input id={`prod-name-${i}`} placeholder="e.g. Signature Latte" value={product.name} onChange={(e) => updateProduct(i, "name", e.target.value)} />
              </div>
              <div className="w-36 space-y-1.5">
                <Label htmlFor={`prod-price-${i}`}>{i === 0 ? "Price (IDR)" : ""}</Label>
                <Input id={`prod-price-${i}`} type="number" placeholder="35000" value={product.price || ""} onChange={(e) => updateProduct(i, "price", Number(e.target.value))} min={0} />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeProduct(i)} disabled={products.length === 1} className="mb-0.5 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {products.some((p) => p.name && p.price > 0) && (
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Preview</p>
            <div className="flex flex-wrap gap-2">
              {products.filter((p) => p.name && p.price > 0).map((p, i) => (
                <span key={i} className="rounded-full bg-background border px-3 py-1 text-xs font-medium">
                  {p.name} — {formatPrice(p.price)}
                </span>
              ))}
            </div>
          </div>
        )}

        <Button variant="outline" onClick={addProduct} className="w-full">
          <Plus className="h-4 w-4" /> Add Another Item
        </Button>

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(1)}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button onClick={handleNext}>
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
