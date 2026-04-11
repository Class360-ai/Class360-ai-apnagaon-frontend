import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Search, Store } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import AvailabilityToggle from "../components/admin/AvailabilityToggle";
import ShopStatusBadge from "../components/ShopStatusBadge";
import { shopsAPI, safeFetch } from "../utils/api";
import { formatAddressLine } from "../utils/locationHelpers";
import { loadShopApplications, normalizeShopApplication } from "../utils/shopApplicationStorage";

const mergeShops = (shops = [], applications = []) => {
  const map = new Map();
  [...applications, ...shops].forEach((item) => {
    const normalized = {
      id: item.id || item._id || item.shopId || `shop_${Date.now()}`,
      name: item.name || item.shopName || "Untitled shop",
      category: item.category || "grocery",
      address: item.address || "",
      area: item.area || "",
      city: item.city || "",
      state: item.state || "",
      phone: item.phone || "",
      whatsapp: item.whatsapp || "",
      ownerName: item.ownerName || "",
      logo: item.logo || item.image || "",
      description: item.description || "",
      openingTime: item.openingTime || "",
      closingTime: item.closingTime || "",
      deliveryAvailable: item.deliveryAvailable !== false,
      available: item.available !== false,
      active: item.active !== false,
      status: item.active === false ? "suspended" : "approved",
      updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
    };
    map.set(normalized.id, normalized);
  });
  return Array.from(map.values()).sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
};

const AdminShopsPage = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const backend = await safeFetch(() => shopsAPI.getAll(), []);
    const backendList = Array.isArray(backend) ? backend : backend?.shops || backend?.data || [];
    const localList = loadShopApplications()
      .filter((application) => application.status === "approved")
      .map((application) => normalizeShopApplication({ ...application, status: "approved", active: true }));
    setShops(mergeShops(backendList, localList));
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    const sync = () => load();
    window.addEventListener("storage", sync);
    window.addEventListener("apnagaon:shop-applications-updated", sync);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", sync);
      window.removeEventListener("apnagaon:shop-applications-updated", sync);
    };
  }, [load]);

  const visibleShops = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return shops.filter((shop) => {
      const searchable = [shop.name, shop.category, shop.area, shop.city, shop.ownerName, shop.phone].filter(Boolean).join(" ").toLowerCase();
      return !normalizedSearch || searchable.includes(normalizedSearch);
    });
  }, [search, shops]);

  const toggleAvailability = async (shop) => {
    const nextAvailable = !shop.available;
    const nextActive = !shop.active;
    const backend = await safeFetch(() => shopsAPI.update(shop.id || shop._id, { available: nextAvailable, active: nextActive }), null);
    if (backend) {
      load();
      return;
    }
    setShops((current) =>
      current.map((item) => (item.id === shop.id ? { ...item, available: nextAvailable, active: nextActive, status: nextActive ? "approved" : "suspended" } : item))
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <section className="flex items-center gap-3 rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <button type="button" onClick={() => navigate(-1)} className="rounded-2xl bg-slate-50 p-3 text-slate-700 ring-1 ring-slate-100" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Approved shops</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">Manage active shops</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">View approved shops and control visibility or availability.</p>
          </div>
          <button type="button" onClick={load} className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 ring-1 ring-emerald-100" aria-label="Refresh shops">
            <RefreshCw className="h-5 w-5" />
          </button>
        </section>

        <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search shops"
              className="w-full rounded-full bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 ring-1 ring-slate-100 outline-none placeholder:text-slate-400"
            />
          </div>
        </section>

        {loading ? <div className="rounded-[28px] bg-white p-5 text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">Loading shops...</div> : null}

        {!loading && !visibleShops.length ? (
          <div className="rounded-[28px] bg-white p-5 text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">No approved shops yet.</div>
        ) : null}

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleShops.map((shop) => (
            <article key={shop.id || shop._id} className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                    <Store className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950">{shop.name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{shop.ownerName || "Owner not set"}</p>
                  </div>
                </div>
                <ShopStatusBadge status={shop.status} />
              </div>

              <div className="mt-3 space-y-1 text-xs font-semibold text-slate-500">
                <p>{shop.category || "grocery"}</p>
                <p>{formatAddressLine(shop)}</p>
                <p>{shop.phone || "Phone not available"}</p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 rounded-[24px] bg-slate-50 p-3 ring-1 ring-slate-100">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">Availability</p>
                  <p className="mt-1 text-sm font-bold text-slate-950">{shop.available ? "Open for orders" : "Unavailable"}</p>
                </div>
                <AvailabilityToggle active={shop.available} onToggle={() => toggleAvailability(shop)} label={shop.available ? "Available" : "Hidden"} />
              </div>

              <button
                type="button"
                onClick={() => navigate("/admin/shops/applications")}
                className="mt-3 w-full rounded-full bg-emerald-600 px-4 py-3 text-xs font-black uppercase tracking-wide text-white shadow-sm shadow-emerald-100"
              >
                Open applications
              </button>
            </article>
          ))}
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminShopsPage;
