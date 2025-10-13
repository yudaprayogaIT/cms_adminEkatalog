// src/components/products/ProductCard.tsx
"use client";

import React from "react";
import Image from "next/image";

interface ProductVariant {
  image?: string;
  images?: string;
}

interface Product {
  image?: string;
  title: string;
  categoryName?: string;
  type?: string;
  uom?: string;
  variants?: ProductVariant[];
}

interface ProductCardProps {
  product: Product;
  variantCount?: number;
  onClick?: () => void;
}

export default function ProductCard({ product, variantCount = 0, onClick }: ProductCardProps) {
  const img = product.image || (product.variants && product.variants[0] && (product.variants[0].images || product.variants[0].image)) || "";

  return (
    <div onClick={onClick} role="button" tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter') onClick?.(); }} className="bg-white rounded-xl shadow p-4 cursor-pointer hover:shadow-lg transition flex flex-col h-full">
      <div className="h-48 bg-gray-50 rounded-md overflow-hidden flex items-center justify-center">
        {img ? <Image src={img} alt={product.title} width={200} height={200} className="object-cover w-full h-full" /> : <div className="text-xs text-gray-400">No image</div>}
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-gray-900">{product.title}</div>
          <div className="text-xs text-gray-500 mt-1">{product.categoryName ?? product.categoryName} • {product.type ?? product.uom}</div>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-500">{variantCount} varian</div>
        </div>
      </div>

      <div className="mt-4">
        <button onClick={(e)=>{ e.stopPropagation(); onClick?.(); }} className="px-3 py-2 rounded bg-[#2563EB] text-white text-xs">View variants</button>
      </div>
    </div>
  );
}
