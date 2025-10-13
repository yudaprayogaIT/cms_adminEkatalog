// src/components/items/ItemCard.tsx
"use client";

import React from "react";

export default function ItemCard({ item, onView, onEdit, onDelete }: any) {
  const img = item.images || item.image || "";
  return (
    <div role="button" tabIndex={0} onClick={onView} onKeyDown={(e)=>{ if(e.key==='Enter') onView(); }} className="bg-white rounded-lg shadow p-3 flex flex-col cursor-pointer border h-full">
      <div className="h-28 bg-gray-50 rounded overflow-hidden mb-2 flex items-center justify-center">
        {img ? <img src={img} alt={item.title} className="object-cover w-full h-full" /> : <div className="text-xs text-gray-400">No image</div>}
      </div>

      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="text-sm font-medium">{item.title}</div>
          <div className="text-xs text-gray-500">{item.productName} • {item.categoryResolved ?? item.category}</div>
        </div>
      </div>

      <div className="mt-auto flex gap-2">
        <button onClick={(e)=>{ e.stopPropagation(); onEdit?.(); }} className="text-xs px-2 py-1 rounded border">Edit</button>
        <button onClick={(e)=>{ e.stopPropagation(); onDelete?.(); }} className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 border">Remove</button>
      </div>
    </div>
  );
}
