// "use client";

import ItemCatalog from "@/components/items/ItemCatalog";
import React from "react";

export const metadata = {
  title: "Items - Admin Pengelola Ekatalog",
};

export default function Page() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-montserrat font-semibold">Items</h1>
        <p className="text-sm text-gray-500">
          Daftar item Ekatalog
        </p>
      </div>

      <ItemCatalog />
    </div>
  );
}
