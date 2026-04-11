import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Package, RefreshCw, Trash2, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminSearchBar from "../components/admin/AdminSearchBar";
import AvailabilityToggle from "../components/admin/AvailabilityToggle";
import ProductFormModal from "../components/admin/ProductFormModal";
import { productsAPI, safeFetch } from "../utils/api";
import {
  ADMIN_CATALOG_EVENT,
  ADMIN_PRODUCT_KEY,
  DEFAULT_ADMIN_PRODUCTS,
  loadAdminCollection,
  normalizeProduct,
  removeAdminCollectionItem,
  toggleAdminCollectionItem,
  upsertAdminCollection,
} from "../utils/adminCatalogStorage";

const mergeProducts = (backendItems = [], localItems = []) => {
  const map = new Map();
  [...backendItems, ...localItems].forEach((item) => {
    const normalized = normalizeProduct(item);
    const key = normalized.id || `${normalized.name}-${normalized.category}`.toLowerCase();
    map.set(key, normalized);
  });
  return Array.from(map.values()).sort((a, b) => String(b.name).localeCompare(String(a.name)));
};

const ProductCard = ({ product, onEdit, onDelete, onToggle }) => {
  const lowStock = Number(product.stock) <= Number(product.minStockAlert || 5);
  return (
    <article className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-100">
      <div className="flex gap-3 p-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[24px] bg-slate-50 ring-1 ring-slate-100">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <Package className="h-8 w-8 text-emerald-600" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-black text-slate-950">{product.name}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">{product.category || "Uncategorized"}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ring-1 ${product.available ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-slate-100 text-slate-500 ring-slate-100"}`}>
              {product.available ? "Available" : "Hidden"}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
            <span className="rounded-full bg-slate-50 px-2 py-1 ring-1 ring-slate-100">{product.unit || "1 unit"}</span>
            <span className={`rounded-full px-2 py-1 ring-1 ${lowStock ? "bg-orange-50 text-orange-700 ring-orange-100" : "bg-slate-50 text-slate-600 ring-slate-100"}`}>
              Stock {product.stock ?? 0}
            </span>
            <span className="rounded-full bg-slate-50 px-2 py-1 ring-1 ring-slate-100">₹{Number(product.price || 0).toFixed(0)}</span>
          </div>
          {product.description ? <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">{product.description}</p> : null}
        </div>
      </div>

      <div className="border-t border-slate-100 p-3">
        <div className="flex flex-wrap gap-2">
          <AvailabilityToggle active={Boolean(product.available)} onToggle={onToggle} label={product.available ? "Available" : "Hidden"} />
          <button type="button" onClick={onEdit} className="rounded-full bg-white px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-700 ring-1 ring-slate-200">
            <Pencil className="mr-1 inline h-3.5 w-3.5" />
            Edit
          </button>
          <button type="button" onClick={onDelete} className="rounded-full bg-red-50 px-3 py-2 text-xs font-black uppercase tracking-wide text-red-700 ring-1 ring-red-100">
            <Trash2 className="mr-1 inline h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
};

const AdminProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const backend = await safeFetch(() => productsAPI.getAll(), null);
    const backendItems = Array.isArray(backend) ? backend : backend?.products || [];
    const localItems = loadAdminCollection(ADMIN_PRODUCT_KEY, DEFAULT_ADMIN_PRODUCTS).map(normalizeProduct);
    const merged = mergeProducts(backendItems, localItems);
    setProducts(merged.length ? merged : DEFAULT_ADMIN_PRODUCTS.map(normalizeProduct));
    setLoading(false);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(loadProducts, 0);
    const sync = () => loadProducts();
    window.addEventListener(ADMIN_CATALOG_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener(ADMIN_CATALOG_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [loadProducts]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((product) => product.category).filter(Boolean)));
    return ["all", ...unique];
  }, [products]);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = categoryFilter === "all" || String(product.category || "").toLowerCase() === categoryFilter.toLowerCase();
      const searchable = [product.name, product.category, product.unit, product.description, ...(Array.isArray(product.tags) ? product.tags : [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, products, search]);

  const saveProduct = async (form) => {
    const normalized = normalizeProduct(form);
    const existingId = editingProduct?.id || editingProduct?._id;

    if (existingId) {
      const backend = await safeFetch(() => productsAPI.update(existingId, normalized), null);
      const next = normalizeProduct(backend || { ...normalized, id: existingId });
      setProducts((current) => mergeProducts(current.map((item) => ((item.id || item._id) === existingId ? next : item)), [next]));
      upsertAdminCollection(ADMIN_PRODUCT_KEY, next, DEFAULT_ADMIN_PRODUCTS, "products");
    } else {
      const backend = await safeFetch(() => productsAPI.create(normalized), null);
      const next = normalizeProduct(backend || normalized);
      setProducts((current) => mergeProducts([next, ...current], [next]));
      upsertAdminCollection(ADMIN_PRODUCT_KEY, next, DEFAULT_ADMIN_PRODUCTS, "products");
    }

    setModalOpen(false);
    setEditingProduct(null);
    loadProducts();
  };

  const deleteProduct = async (product) => {
    const id = product.id || product._id;
    if (id) await safeFetch(() => productsAPI.remove(id), null);
    removeAdminCollectionItem(ADMIN_PRODUCT_KEY, id, DEFAULT_ADMIN_PRODUCTS, "products");
    setProducts((current) => current.filter((item) => (item.id || item._id) !== id));
  };

  const toggleProduct = async (product) => {
    const id = product.id || product._id;
    const nextAvailable = !product.available;
    const updated = normalizeProduct({ ...product, available: nextAvailable });
    if (id) await safeFetch(() => productsAPI.update(id, { available: nextAvailable }), null);
    toggleAdminCollectionItem(ADMIN_PRODUCT_KEY, id, "available", DEFAULT_ADMIN_PRODUCTS, "products");
    setProducts((current) => current.map((item) => ((item.id || item._id) === id ? updated : item)));
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-28 pt-4">
      <main className="mx-auto max-w-7xl space-y-4">
        <div className="flex items-center gap-3 rounded-[28px] bg-white p-3 shadow-sm ring-1 ring-slate-100">
          <button type="button" onClick={() => navigate(-1)} className="rounded-2xl bg-slate-50 p-3 text-slate-700 ring-1 ring-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Admin catalog</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">Products</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">Manage products, stock, and availability from one place.</p>
          </div>
          <button type="button" onClick={loadProducts} className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 ring-1 ring-emerald-100">
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>

        <AdminSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search products"
          actionLabel="Add Product"
          onAction={() => {
            setEditingProduct(null);
            setModalOpen(true);
          }}
          filters={categories.map((category) => ({ label: category === "all" ? "All" : category, value: category }))}
          activeFilter={categoryFilter}
          onFilterChange={setCategoryFilter}
        />

        {loading ? <div className="rounded-[28px] bg-white p-5 text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">Loading products...</div> : null}

        {!loading && !visibleProducts.length ? (
          <div className="rounded-[28px] bg-white p-5 text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">No products found. Add a new product to start the catalog.</div>
        ) : null}

        <section className="grid gap-3 lg:grid-cols-2">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id || product._id || product.name}
              product={product}
              onEdit={() => {
                setEditingProduct(product);
                setModalOpen(true);
              }}
              onDelete={() => deleteProduct(product)}
              onToggle={() => toggleProduct(product)}
            />
          ))}
        </section>
      </main>

      <ProductFormModal open={modalOpen} initialData={editingProduct} onClose={() => setModalOpen(false)} onSave={saveProduct} />
    </div>
  );
};

export default AdminProductsPage;
