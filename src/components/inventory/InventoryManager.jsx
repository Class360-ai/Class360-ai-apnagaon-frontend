import React from "react";
import { formatPrice } from "../../utils/helpers";
import ProductForm from "./ProductForm";
import StockBadge from "./StockBadge";

const InventoryManager = ({ products = [], productForm, setProductForm, onSaveProduct, onToggleProduct, onDeleteProduct, onUpdateStock }) => (
  <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
    <h2 className="text-lg font-black text-slate-950">Inventory Manager</h2>
    <p className="mt-1 text-xs font-bold text-slate-500">Add products, control stock, and hide unavailable items.</p>
    <div className="mt-3">
      <ProductForm value={productForm} onChange={setProductForm} onSave={onSaveProduct} />
    </div>
    <div className="mt-4 grid gap-2 md:grid-cols-2">
      {products.map((product) => (
        <article key={product._id || product.id} className="rounded-2xl bg-slate-50 p-3 text-left text-xs font-bold text-slate-600">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="block truncate text-sm font-black text-slate-950">{product.name}</span>
              <span>{formatPrice(product.price || 0)} / {product.unit || "piece"}</span>
            </div>
            <StockBadge stock={product.stock} available={product.available} minStockAlert={product.minStockAlert} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => onUpdateStock(product, Math.max(0, (Number(product.stock) || 0) - 1))} className="rounded-full bg-white px-3 py-2 ring-1 ring-slate-200">- Stock</button>
            <button type="button" onClick={() => onUpdateStock(product, (Number(product.stock) || 0) + 1)} className="rounded-full bg-white px-3 py-2 ring-1 ring-slate-200">+ Stock</button>
            <button type="button" onClick={() => onToggleProduct(product)} className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700 ring-1 ring-emerald-100">{product.available ? "Mark Hidden" : "Mark Available"}</button>
            <button type="button" onClick={() => onDeleteProduct(product)} className="rounded-full bg-red-50 px-3 py-2 text-red-700 ring-1 ring-red-100">Delete</button>
          </div>
        </article>
      ))}
      {!products.length ? <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No products yet.</p> : null}
    </div>
  </section>
);

export default InventoryManager;
