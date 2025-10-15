// src/components/products/ProductCatalog.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "./ProductCard";
import ProductDetailModal from "./ProductDetailModal";
import AddProductModal from "./AddProductModal";
import AddEditItemModal from "@/components/items/AddEditItemModal";

const SNAP_PRODUCTS = "ekatalog_products_snapshot";
const SNAP_ITEMS = "ekatalog_items_snapshot";

type Product = { id: number | string; title?: string; [k: string]: any };
type Item = {
  id?: number | string;
  productId?: number | string;
  title?: string;
  [k: string]: any;
};

async function fetchJson(path: string) {
  try {
    const r = await fetch(path, { cache: "no-store" });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [detailVariants, setDetailVariants] = useState<Item[]>([]);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productModalInitial, setProductModalInitial] =
    useState<Product | null>(null);

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemModalInitial, setItemModalInitial] = useState<Item | null>(null);

  // Load products & items (try API -> snapshot -> static)
  async function loadAll() {
    setLoading(true);
    setError(null);

    const [pApi, iApi] = await Promise.all([
      fetchJson("/api/products"),
      fetchJson("/api/items"),
    ]);

    if (pApi !== null && iApi !== null) {
      setProducts(Array.isArray(pApi) ? pApi : []);
      setItems(Array.isArray(iApi) ? iApi : []);
      try {
        localStorage.setItem(SNAP_PRODUCTS, JSON.stringify(pApi));
        localStorage.setItem(SNAP_ITEMS, JSON.stringify(iApi));
      } catch {}
      setLoading(false);
      return;
    }

    // snapshot fallback
    try {
      const rawP = localStorage.getItem(SNAP_PRODUCTS);
      const rawI = localStorage.getItem(SNAP_ITEMS);
      if (rawP || rawI) {
        setProducts(rawP ? JSON.parse(rawP) : []);
        setItems(rawI ? JSON.parse(rawI) : []);
        setLoading(false);
        return;
      }
    } catch (err) {
      // ignore
    }

    // static fallback
    try {
      const [pStatic, iStatic] = await Promise.all([
        fetchJson("/data/products.json"),
        fetchJson("/data/items.json"),
      ]);
      setProducts(Array.isArray(pStatic) ? pStatic : []);
      setItems(Array.isArray(iStatic) ? iStatic : []);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();

    const onProductsUpdate = () => loadAll();
    const onItemsUpdate = () => loadAll();

    window.addEventListener("ekatalog:products_update", onProductsUpdate);
    window.addEventListener("ekatalog:items_update", onItemsUpdate);

    return () => {
      window.removeEventListener("ekatalog:products_update", onProductsUpdate);
      window.removeEventListener("ekatalog:items_update", onItemsUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openDetail(p: Product) {
    setDetailProduct(p);
    // compute fresh variants for this product from `items` state
    const vs = items.filter((it) => String(it.productId) === String(p.id));
    setDetailVariants(vs);
    setDetailOpen(true);

    // Also try to fetch fresh variants from API in background (update state when done)
    (async () => {
      try {
        const r = await fetch(
          `/api/items?productId=${encodeURIComponent(String(p.id))}`,
          { cache: "no-store" }
        );
        if (r.ok) {
          const d = await r.json();
          setDetailVariants(Array.isArray(d) ? d : []);
          try {
            localStorage.setItem(SNAP_ITEMS, JSON.stringify(d));
          } catch {}
        }
      } catch {}
    })();
  }
  function closeDetail() {
    setDetailOpen(false);
    setDetailProduct(null);
    setDetailVariants([]);
  }

  function openAddProduct() {
    setProductModalInitial(null);
    setProductModalOpen(true);
  }
  function openEditProduct(p: Product) {
    setProductModalInitial(p);
    setProductModalOpen(true);
  }

  function openAddItemForProduct(p: Product) {
    // prefill productId for new variant
    setItemModalInitial({ productId: p.id } as Item);
    setItemModalOpen(true);
  }
  function openEditItem(it: Item) {
    // get fresh item from items state if available
    const fresh = items.find((x) => String(x.id) === String(it.id)) || it;
    setItemModalInitial(fresh);
    setItemModalOpen(true);
  }

  if (loading)
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        Loading products...
      </div>
    );
  if (error)
    return (
      <div className="py-8 text-center text-sm text-red-500">
        Error: {error}
      </div>
    );

  const byProduct = products.map((p) => ({
    ...p,
    variants: items.filter((it) => String(it.productId) === String(p.id)),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="mb-6">
          <h1 className="text-base md:text-xl xl:text-2xl font-montserrat font-semibold">
            Products
          </h1>
          <p className="text-[9px] md:text-sm text-gray-500">
            Daftar produk — klik product untuk melihat varian
          </p>
        </div>
        <button
          onClick={openAddProduct}
          className="px-2 py-1.5 md:px-3 md:py-2 bg-[#2563EB] text-white rounded-md text-[9px] md:text-sm"
        >
          Add Product
        </button>
      </div>

      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <AnimatePresence>
          {byProduct.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <ProductCard
                product={p}
                variantCount={(p.variants || []).length}
                onClick={() => openDetail(p)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <ProductDetailModal
        open={detailOpen}
        onClose={closeDetail}
        product={detailProduct}
        variants={detailVariants}
        onEditProduct={(p: Product) => openEditProduct(p)}
        onEditItem={(it: Item) => openEditItem(it)}
        onAddItemForProduct={(p: Product) => openAddItemForProduct(p)}
      />

      <AddProductModal
        open={productModalOpen}
        onClose={() => {
          setProductModalOpen(false);
          loadAll();
        }}
        initial={productModalInitial}
      />

      <AddEditItemModal
        open={itemModalOpen}
        onClose={() => {
          setItemModalOpen(false);
          loadAll();
        }}
        initial={itemModalInitial}
        products={products}
      />
    </div>
  );
}
