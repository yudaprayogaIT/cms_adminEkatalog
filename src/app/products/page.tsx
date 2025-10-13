// src/app/products/page.tsx
"use client";

import ProductCatalog from "@/components/products/ProductCatalog";
import React from "react";

export default function Page() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-montserrat font-semibold">Products</h1>
        <p className="text-sm text-gray-500">
          Daftar produk — klik product untuk melihat varian
        </p>
      </div>

      <ProductCatalog />
    </div>
  );
}
