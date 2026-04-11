import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PackageCheck, RefreshCw, ShoppingBag, Store, Tag, Truck } from "lucide-react";
import ShopLayout from "../components/ShopLayout";
import OrderStatusBadge from "../components/OrderStatusBadge";
import InventoryManager from "../components/inventory/InventoryManager";
import AdminSearchBar from "../components/admin/AdminSearchBar";
import AvailabilityToggle from "../components/admin/AvailabilityToggle";
import OfferFormModal from "../components/admin/OfferFormModal";
import { useAuth } from "../context/useAuth";
import { formatPrice } from "../utils/helpers";
import { formatAddressLine } from "../utils/locationHelpers";
import { ordersAPI, productsAPI, safeFetch } from "../utils/api";
import {
  ADMIN_CATALOG_EVENT,
  ADMIN_OFFER_KEY,
  DEFAULT_ADMIN_OFFERS,
  loadAdminCollection,
  normalizeOffer,
  normalizeProduct,
  removeAdminCollectionItem,
  toggleAdminCollectionItem,
  upsertAdminCollection,
} from "../utils/adminCatalogStorage";
import { normalizeRole } from "../utils/roleUtils";

const defaultProduct = { name: "", category: "grocery", price: "", stock: "", minStockAlert: "5", unit: "piece", available: true, description: "" };

const pathToSection = (pathname = "") => {
  if (pathname.includes("/products")) return "products";
  if (pathname.includes("/orders")) return "orders";
  if (pathname.includes("/offers")) return "offers";
  return "dashboard";
};

const toneClass = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  orange: "bg-orange-50 text-orange-700 ring-orange-100",
  blue: "bg-sky-50 text-sky-700 ring-sky-100",
  slate: "bg-slate-50 text-slate-700 ring-slate-100",
};

const ShopDashboard = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const section = pathToSection(location.pathname);
  const role = normalizeRole(auth.user?.role);
  const shopScopeId = role === "shop" ? auth.user?.shopId || auth.user?.shop?.id || auth.user?.shopId?._id || null : null;

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState(defaultProduct);
  const [offers, setOffers] = useState([]);
  const [offerOpen, setOfferOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [orderData, productData] = await Promise.all([
      safeFetch(() => ordersAPI.getAll(), []),
      safeFetch(() => productsAPI.getAll(), []),
    ]);
    const orderList = Array.isArray(orderData) ? orderData : orderData?.orders || [];
    const productList = Array.isArray(productData) ? productData : productData?.products || [];

    setOrders(
      (Array.isArray(orderList) ? orderList : []).filter((order) => {
        if (!shopScopeId) return true;
        return String(order.shopId || order.shop?._id || "") === String(shopScopeId);
      })
    );

    setProducts(
      (Array.isArray(productList) ? productList : [])
        .map(normalizeProduct)
        .filter((product) => {
          if (!shopScopeId) return true;
          return String(product.shopId || product.shop?._id || "") === String(shopScopeId);
        })
    );

    const localOffers = loadAdminCollection(ADMIN_OFFER_KEY, DEFAULT_ADMIN_OFFERS).map(normalizeOffer);
    setOffers(localOffers);
    setLoading(false);
  }, [shopScopeId]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    const sync = () => load();
    window.addEventListener(ADMIN_CATALOG_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(ADMIN_CATALOG_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [load]);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const delivered = orders.filter((order) => order.status === "delivered");
    const pending = orders.filter((order) => ["placed", "confirmed"].includes(order.status));
    return {
      products: products.length,
      lowStock: products.filter((product) => Number(product.stock) <= Number(product.minStockAlert || 5)).length,
      todayOrders: orders.filter((order) => new Date(order.createdAt || 0).toDateString() === today).length,
      pendingOrders: pending.length,
      todayEarnings: delivered
        .filter((order) => new Date(order.updatedAt || order.createdAt).toDateString() === today)
        .reduce((sum, order) => sum + (Number(order.total || order.totals?.total) || 0), 0),
    };
  }, [orders, products]);

  const saveProduct = async () => {
    if (!productForm.name || !productForm.price) return;
    const payload = {
      ...productForm,
      price: Number(productForm.price),
      stock: Number(productForm.stock) || 0,
      minStockAlert: Number(productForm.minStockAlert) || 5,
      shopId: shopScopeId || productForm.shopId || null,
      available: productForm.available !== false && (Number(productForm.stock) || 0) > 0,
    };
    await safeFetch(() => productsAPI.create(payload), null);
    setProductForm(defaultProduct);
    load();
  };

  const toggleProduct = async (product) => {
    await safeFetch(() => productsAPI.update(product._id || product.id, { available: !product.available }), null);
    load();
  };

  const updateProductStock = async (product, stock) => {
    await safeFetch(() => productsAPI.update(product._id || product.id, { stock, available: stock > 0 ? product.available : false }), null);
    load();
  };

  const deleteProduct = async (product) => {
    await safeFetch(() => productsAPI.remove(product._id || product.id), null);
    load();
  };

  const updateOrder = async (order, status) => {
    await safeFetch(() => ordersAPI.updateStatus(order._id || order.id || order.orderId, status), null);
    load();
  };

  const saveOffer = (form) => {
    const next = normalizeOffer({ ...form, id: editingOffer?.id || editingOffer?._id || form.id, shopId: shopScopeId || null });
    upsertAdminCollection(ADMIN_OFFER_KEY, next, DEFAULT_ADMIN_OFFERS, "offers");
    setOffers((current) => {
      const map = new Map();
      [...current, next].forEach((item) => map.set(item.id || item._id, item));
      return Array.from(map.values());
    });
    setEditingOffer(null);
    setOfferOpen(false);
  };

  const deleteOffer = (offer) => {
    removeAdminCollectionItem(ADMIN_OFFER_KEY, offer.id || offer._id, DEFAULT_ADMIN_OFFERS, "offers");
    setOffers((current) => current.filter((item) => (item.id || item._id) !== (offer.id || offer._id)));
  };

  const toggleOffer = (offer) => {
    toggleAdminCollectionItem(ADMIN_OFFER_KEY, offer.id || offer._id, "active", DEFAULT_ADMIN_OFFERS, "offers");
    setOffers((current) => current.map((item) => ((item.id || item._id) === (offer.id || offer._id) ? { ...item, active: !item.active } : item)));
  };

  const visibleOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return orders.filter((order) => {
      const searchable = [order.orderId, order.customerName, order.phone, formatAddressLine(order.address || {})].filter(Boolean).join(" ").toLowerCase();
      return !normalizedSearch || searchable.includes(normalizedSearch);
    });
  }, [orders, search]);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return products.filter((product) => {
      const searchable = [product.name, product.category, product.unit, product.description].filter(Boolean).join(" ").toLowerCase();
      return !normalizedSearch || searchable.includes(normalizedSearch);
    });
  }, [products, search]);

  const visibleOffers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return offers.filter((offer) => {
      const matchesScope = !shopScopeId || !offer.shopId || String(offer.shopId) === String(shopScopeId);
      const searchable = [offer.title, offer.code, offer.offerType, offer.bannerText].filter(Boolean).join(" ").toLowerCase();
      return matchesScope && (!normalizedSearch || searchable.includes(normalizedSearch));
    });
  }, [offers, search, shopScopeId]);

  return (
    <ShopLayout>
      <div className="space-y-4">
        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            ["Products", stats.products, "emerald"],
            ["Low stock", stats.lowStock, "orange"],
            ["Today orders", stats.todayOrders, "blue"],
            ["Pending", stats.pendingOrders, "slate"],
          ].map(([label, value, tone]) => (
            <div key={label} className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
                </div>
                <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ring-1 ${toneClass[tone]}`}>
                  {tone === "emerald" ? <ShoppingBag className="h-5 w-5" /> : tone === "orange" ? <Store className="h-5 w-5" /> : tone === "blue" ? <Truck className="h-5 w-5" /> : <Tag className="h-5 w-5" />}
                </span>
              </div>
            </div>
          ))}
        </section>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            ["dashboard", "Dashboard"],
            ["products", "Products"],
            ["orders", "Orders"],
            ["offers", "Offers"],
          ].map(([id, label]) => {
            const active = section === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => navigate(`/shop/${id}`)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-black uppercase tracking-wide ring-1 transition ${
                  active ? "bg-emerald-600 text-white ring-emerald-600 shadow-sm shadow-emerald-100" : "bg-white text-slate-600 ring-slate-100"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Quick search</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">Find products, orders, or offers</h2>
            </div>
            <button type="button" onClick={load} className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 ring-1 ring-emerald-100">
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3">
            <AdminSearchBar value={search} onChange={setSearch} placeholder="Search inside your shop workspace" />
          </div>
        </div>

        {loading ? <div className="rounded-[24px] bg-white p-5 text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">Loading shop workspace...</div> : null}

        {section !== "offers" ? (
          <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">{section === "orders" ? "Orders" : "Products"}</p>
                <h2 className="mt-1 text-lg font-black text-slate-950">{section === "orders" ? "Order queue" : "Inventory manager"}</h2>
              </div>
              <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-slate-600 ring-1 ring-slate-100">
                {role === "admin" ? "Admin scope" : "Own shop only"}
              </span>
            </div>
            <div className="mt-4">
              {section === "orders" ? (
                <div className="space-y-3">
                  {visibleOrders.length ? (
                    visibleOrders.map((order) => (
                      <article key={order._id || order.id || order.orderId} className="rounded-[26px] bg-slate-50 p-4 ring-1 ring-slate-100">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-black text-slate-950">#{order.orderId || order._id || order.id}</p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">{order.customerName || order.customer?.name || "Customer"}</p>
                          </div>
                          <OrderStatusBadge status={order.status || "placed"} />
                        </div>
                        <p className="mt-2 text-sm font-black text-slate-950">
                          {order.items?.length || 0} items · {formatPrice(order.total || order.totals?.total || 0)}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{formatAddressLine(order.address || {})}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button type="button" onClick={() => updateOrder(order, "confirmed")} className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">
                            Accept
                          </button>
                          <button type="button" onClick={() => updateOrder(order, "preparing")} className="rounded-full bg-white px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200">
                            Preparing
                          </button>
                          <button type="button" onClick={() => updateOrder(order, "out_for_delivery")} className="rounded-full bg-orange-50 px-3 py-2 text-xs font-black text-orange-700 ring-1 ring-orange-100">
                            Out for delivery
                          </button>
                          <button type="button" onClick={() => updateOrder(order, "delivered")} className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-black text-white">
                            Delivered
                          </button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="rounded-[24px] bg-slate-50 p-4 text-sm font-semibold text-slate-500">No shop orders found.</p>
                  )}
                </div>
              ) : (
                <InventoryManager
                  products={visibleProducts}
                  productForm={productForm}
                  setProductForm={setProductForm}
                  onSaveProduct={saveProduct}
                  onToggleProduct={toggleProduct}
                  onDeleteProduct={deleteProduct}
                  onUpdateStock={updateProductStock}
                />
              )}
            </div>
          </section>
        ) : null}

        {section === "dashboard" ? (
          <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Today earnings</p>
                <h2 className="mt-1 text-lg font-black text-slate-950">{formatPrice(stats.todayEarnings)}</h2>
              </div>
              <PackageCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => navigate("/shop/products")} className="rounded-full bg-emerald-600 px-4 py-4 text-sm font-black text-white">
                Manage products
              </button>
              <button type="button" onClick={() => navigate("/shop/orders")} className="rounded-full bg-white px-4 py-4 text-sm font-black text-slate-900 ring-1 ring-slate-100">
                View orders
              </button>
            </div>
          </section>
        ) : null}

        {section === "offers" ? (
          <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Offers</p>
                <h2 className="mt-1 text-lg font-black text-slate-950">Shop offers</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingOffer(null);
                  setOfferOpen(true);
                }}
                className="rounded-full bg-emerald-600 px-4 py-3 text-xs font-black uppercase tracking-wide text-white"
              >
                Add offer
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {visibleOffers.length ? (
                visibleOffers.map((offer) => (
                  <div key={offer.id || offer._id} className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-950">{offer.title}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{offer.code || "No code"} · {offer.offerType}</p>
                      </div>
                      <AvailabilityToggle active={Boolean(offer.active)} onToggle={() => toggleOffer(offer)} label={offer.active ? "Active" : "Inactive"} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => {
                        setEditingOffer(offer);
                        setOfferOpen(true);
                      }} className="rounded-full bg-white px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-700 ring-1 ring-slate-200">
                        Edit
                      </button>
                      <button type="button" onClick={() => deleteOffer(offer)} className="rounded-full bg-red-50 px-3 py-2 text-xs font-black uppercase tracking-wide text-red-700 ring-1 ring-red-100">
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-[24px] bg-slate-50 p-4 text-sm font-semibold text-slate-500">No offers yet.</p>
              )}
            </div>
          </section>
        ) : null}
      </div>

      <OfferFormModal open={offerOpen} initialData={editingOffer} onClose={() => setOfferOpen(false)} onSave={saveOffer} />
    </ShopLayout>
  );
};

export default ShopDashboard;
