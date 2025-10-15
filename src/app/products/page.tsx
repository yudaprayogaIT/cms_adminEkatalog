// src/app/products/page.tsx
"use client";

import ProductCatalog from "@/components/products/ProductCatalog";
import React from "react";

export default function Page() {
  return (
    <div className="space-y-6">
      <ProductCatalog />
    </div>
  );
}
