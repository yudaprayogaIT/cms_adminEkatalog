// src/components/products/ProductCatalog.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AddEditItemModal from "../items/AddEditItemModal";
import AddProductModal from "./AddProductModal";
import ProductDetailModal from "./ProductDetailModal";
import ProductCard from "./ProductCard";

type ProductVariant = {
  id: number | string;
  productId: number | string;
  name: string;
  [key: string]: unknown;
};
type Item = ProductVariant;

type Product = {
  id: number | string;
  name: string;
  [key: string]: unknown;
  variants?: ProductVariant[];
};

async function loadJson(path: string) {
  try {
    const r = await fetch(path, { cache: "no-store" });
    if (!r.ok) throw new Error("fetch failed");
    return await r.json();
  } catch {
    return [];
  }
}

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productModalInitial, setProductModalInitial] = useState<Product | null>(null);

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemModalInitial, setItemModalInitial] = useState<Item | null>(null);

  async function loadAll() {
    setLoading(true);
    const [prods, itms] = await Promise.all([
      loadJson("/data/products.json"),
      loadJson("/data/items.json"),
    ]);
    setProducts(Array.isArray(prods) ? prods : []);
    setItems(Array.isArray(itms) ? itms : []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // listen for local snapshot updates if other parts update localStorage (optional)
    const h = () => loadAll();
    window.addEventListener("ekatalog:products_update", h);
    window.addEventListener("ekatalog:items_update", h);
    return () => {
      window.removeEventListener("ekatalog:products_update", h);
      window.removeEventListener("ekatalog:items_update", h);
    };
  }, []);

  const byProduct = products.map((p) => ({
    ...p,
    variants: items.filter((it) => Number(it.productId) === Number(p.id)),
  }));

  function openDetail(p: Product) {
    setDetailProduct(p);
    setDetailOpen(true);
  }
  function closeDetail() {
    setDetailOpen(false);
    setDetailProduct(null);
  }

  function openAddProduct() { setProductModalInitial(null); setProductModalOpen(true); }
  function openEditProduct(p: Product) { setProductModalInitial(p); setProductModalOpen(true); }

  function openAddItemForProduct(p: Product) { setItemModalInitial(null); setItemModalOpen(true); /* Add product context via localStorage or props if desired */ }
  function openEditItem(it: Item) { setItemModalInitial(it); setItemModalOpen(true); }

  if (loading) return <div className="py-8 text-center text-sm text-gray-500">Loading products...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Products</h2>
          <div className="text-sm text-gray-500">Klik product untuk melihat varian</div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={openAddProduct} className="px-3 py-2 bg-[#2563EB] text-white rounded-md text-sm">Add Product</button>
        </div>
      </div>

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {byProduct.map((p) => (
            <motion.div key={p.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ProductCard product={p} variantCount={p.variants.length} onClick={() => openDetail(p)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <ProductDetailModal
        open={detailOpen}
        onClose={closeDetail}
        product={detailProduct}
        variants={detailProduct ? (detailProduct.variants || []) : []}
        onEditProduct={(p: Product) => { openEditProduct(p); }}
        onEditItem={(it: Item) => { openEditItem(it); }}
      />

      <AddProductModal open={productModalOpen} onClose={() => { setProductModalOpen(false); loadAll(); }} initial={productModalInitial} />
      <AddEditItemModal open={itemModalOpen} onClose={() => { setItemModalOpen(false); loadAll(); }} initial={itemModalInitial} products={products} />
    </div>
  );
}
