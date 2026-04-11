import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, RefreshCw, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminSearchBar from "../components/admin/AdminSearchBar";
import AvailabilityToggle from "../components/admin/AvailabilityToggle";
import ServiceFormModal from "../components/admin/ServiceFormModal";
import { servicesAPI, safeFetch } from "../utils/api";
import {
  ADMIN_CATALOG_EVENT,
  ADMIN_SERVICE_KEY,
  DEFAULT_ADMIN_SERVICES,
  loadAdminCollection,
  normalizeService,
  removeAdminCollectionItem,
  toggleAdminCollectionItem,
  upsertAdminCollection,
} from "../utils/adminCatalogStorage";

const mergeServices = (backendItems = [], localItems = []) => {
  const map = new Map();
  [...backendItems, ...localItems].forEach((item) => {
    const normalized = normalizeService(item);
    const key = normalized.id || `${normalized.serviceType}-${normalized.providerName}-${normalized.phone}`.toLowerCase();
    map.set(key, normalized);
  });
  return Array.from(map.values()).sort((a, b) => String(a.providerName).localeCompare(String(b.providerName)));
};

const ServiceCard = ({ service, onEdit, onDelete, onToggle }) => (
  <article className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-base font-black text-slate-950">{service.serviceType}</p>
        <p className="mt-1 text-sm font-semibold text-slate-500">{service.providerName}</p>
      </div>
      <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ring-1 ${service.available ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-slate-100 text-slate-500 ring-slate-100"}`}>
        {service.available ? "Available" : "Hidden"}
      </span>
    </div>

    <div className="mt-3 grid gap-2 rounded-[24px] bg-slate-50 p-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-3">
        <span>Phone</span>
        <span className="font-black text-slate-950">{service.phone || "No phone"}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span>Area</span>
        <span className="font-black text-slate-950">{service.area || "-"}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span>City</span>
        <span className="font-black text-slate-950">{service.city || "-"}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span>Price</span>
        <span className="font-black text-slate-950">{service.price ? `₹${service.price}` : "On request"}</span>
      </div>
    </div>

    <div className="mt-3 flex flex-wrap gap-2">
      <AvailabilityToggle active={Boolean(service.available)} onToggle={onToggle} label={service.available ? "Available" : "Hidden"} />
      <button type="button" onClick={onEdit} className="rounded-full bg-white px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-700 ring-1 ring-slate-200">
        <Pencil className="mr-1 inline h-3.5 w-3.5" />
        Edit
      </button>
      <button type="button" onClick={onDelete} className="rounded-full bg-red-50 px-3 py-2 text-xs font-black uppercase tracking-wide text-red-700 ring-1 ring-red-100">
        <Trash2 className="mr-1 inline h-3.5 w-3.5" />
        Delete
      </button>
    </div>
  </article>
);

const AdminServicesPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    const backend = await safeFetch(() => servicesAPI.getAll(), null);
    const backendItems = Array.isArray(backend) ? backend : backend?.services || [];
    const localItems = loadAdminCollection(ADMIN_SERVICE_KEY, DEFAULT_ADMIN_SERVICES).map(normalizeService);
    const merged = mergeServices(backendItems, localItems);
    setServices(merged.length ? merged : DEFAULT_ADMIN_SERVICES.map(normalizeService));
    setLoading(false);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(loadServices, 0);
    const sync = () => loadServices();
    window.addEventListener(ADMIN_CATALOG_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener(ADMIN_CATALOG_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [loadServices]);

  const visibleServices = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return services.filter((service) => {
      const matchesFilter = filter === "all" ? true : filter === "available" ? service.available : !service.available;
      const searchable = [service.serviceType, service.providerName, service.phone, service.area, service.city].filter(Boolean).join(" ").toLowerCase();
      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
      return matchesFilter && matchesSearch;
    });
  }, [filter, search, services]);

  const saveService = async (form) => {
    const normalized = normalizeService({ ...form, id: editingService?.id || editingService?._id || form.id });
    const existingId = editingService?.id || editingService?._id;
    if (!existingId) {
      const backend = await safeFetch(() => servicesAPI.create(normalized), null);
      const next = normalizeService(backend || normalized);
      upsertAdminCollection(ADMIN_SERVICE_KEY, next, DEFAULT_ADMIN_SERVICES, "services");
      setServices((current) => mergeServices([next, ...current], [next]));
    } else {
      const backend = await safeFetch(() => servicesAPI.update(existingId, normalized), null);
      const next = normalizeService(backend || normalized);
      upsertAdminCollection(ADMIN_SERVICE_KEY, normalized, DEFAULT_ADMIN_SERVICES, "services");
      setServices((current) => current.map((item) => ((item.id || item._id) === existingId ? next : item)));
    }
    setModalOpen(false);
    setEditingService(null);
    loadServices();
  };

  const deleteService = async (service) => {
    const id = service.id || service._id;
    await safeFetch(() => servicesAPI.remove(id), null);
    removeAdminCollectionItem(ADMIN_SERVICE_KEY, service.id || service._id, DEFAULT_ADMIN_SERVICES, "services");
    setServices((current) => current.filter((item) => (item.id || item._id) !== (service.id || service._id)));
  };

  const toggleService = async (service) => {
    const id = service.id || service._id;
    const nextAvailable = !service.available;
    await safeFetch(() => servicesAPI.update(id, { ...service, available: nextAvailable }), null);
    toggleAdminCollectionItem(ADMIN_SERVICE_KEY, service.id || service._id, "available", DEFAULT_ADMIN_SERVICES, "services");
    setServices((current) => current.map((item) => ((item.id || item._id) === id ? { ...item, available: nextAvailable } : item)));
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-28 pt-4">
      <main className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center gap-3 rounded-[28px] bg-white p-3 shadow-sm ring-1 ring-slate-100">
          <button type="button" onClick={() => navigate(-1)} className="rounded-2xl bg-slate-50 p-3 text-slate-700 ring-1 ring-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Admin catalog</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">Services</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">Manage local service providers and their availability.</p>
          </div>
          <button type="button" onClick={loadServices} className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 ring-1 ring-emerald-100">
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>

        <AdminSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search services"
          actionLabel="Add Service"
          onAction={() => {
            setEditingService(null);
            setModalOpen(true);
          }}
          filters={[
            { label: "All", value: "all" },
            { label: "Available", value: "available" },
            { label: "Hidden", value: "hidden" },
          ]}
          activeFilter={filter}
          onFilterChange={setFilter}
        />

        {loading ? <div className="rounded-[28px] bg-white p-5 text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">Loading services...</div> : null}

        {!loading && !visibleServices.length ? (
          <div className="rounded-[28px] bg-white p-5 text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">No services found. Add a provider to start the panel.</div>
        ) : null}

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleServices.map((service) => (
            <ServiceCard
              key={service.id || service._id || `${service.serviceType}-${service.providerName}`}
              service={service}
              onEdit={() => {
                setEditingService(service);
                setModalOpen(true);
              }}
              onDelete={() => deleteService(service)}
              onToggle={() => toggleService(service)}
            />
          ))}
        </section>
      </main>

      <ServiceFormModal open={modalOpen} initialData={editingService} onClose={() => setModalOpen(false)} onSave={saveService} />
    </div>
  );
};

export default AdminServicesPage;
