import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Search } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import ShopApplicationCard from "../components/ShopApplicationCard";
import ShopStatusBadge from "../components/ShopStatusBadge";
import { partnersAPI, safeFetch } from "../utils/api";
import { formatAddressLine } from "../utils/locationHelpers";
import { loadShopApplications, normalizeShopApplication, updateShopApplicationStatus, upsertShopApplication } from "../utils/shopApplicationStorage";

const FILTERS = ["all", "pending", "approved", "rejected", "suspended"];

const mergeApplications = (primary = [], secondary = []) => {
  const map = new Map();
  [...secondary, ...primary].forEach((item) => {
    const normalized = normalizeShopApplication(item);
    const key = normalized.id || normalized._id || normalized.phone;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, normalized);
      return;
    }
    const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
    const nextTime = new Date(normalized.updatedAt || normalized.createdAt || 0).getTime();
    map.set(key, nextTime >= existingTime ? normalized : existing);
  });
  return Array.from(map.values()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

const AdminShopApplicationsPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [reviewNote, setReviewNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const backend = await safeFetch(() => partnersAPI.adminList(), []);
    const backendList = Array.isArray(backend) ? backend : backend?.partners || backend?.data || [];
    const localList = loadShopApplications();
    setApplications(mergeApplications(backendList, localList));
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

  const selectedApplication = useMemo(
    () => applications.find((item) => (item.id || item._id) === selectedId) || null,
    [applications, selectedId]
  );

  useEffect(() => {
    setReviewNote(selectedApplication?.reviewNote || "");
  }, [selectedApplication]);

  const counts = useMemo(() => {
    const next = { all: applications.length };
    FILTERS.slice(1).forEach((status) => {
      next[status] = applications.filter((item) => item.status === status).length;
    });
    return next;
  }, [applications]);

  const visibleApplications = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return applications.filter((item) => {
      const matchesFilter = filter === "all" ? true : item.status === filter;
      const searchable = [item.shopName, item.ownerName, item.phone, item.whatsapp, item.area, item.city, item.category]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesFilter && (!normalizedSearch || searchable.includes(normalizedSearch));
    });
  }, [applications, filter, search]);

  const updateStatus = async (application, status) => {
    const id = application.id || application._id;
    const note = reviewNote.trim();
    const backend = await safeFetch(() => partnersAPI.updateStatus(id, status, note), null);
    if (backend) {
      const normalized = normalizeShopApplication(backend);
      upsertShopApplication(normalized);
      setApplications((current) => mergeApplications([normalized], current));
      setSelectedId(normalized.id);
      setReviewNote(normalized.reviewNote || "");
      return;
    }

    const local = updateShopApplicationStatus(id, status, note);
    setApplications((current) => mergeApplications(local, current));
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <section className="flex items-center gap-3 rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <button type="button" onClick={() => navigate(-1)} className="rounded-2xl bg-slate-50 p-3 text-slate-700 ring-1 ring-slate-100" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Shop applications</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">Review new shop requests</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">Approve, reject, or review local shop owners before they go live.</p>
          </div>
          <button type="button" onClick={load} className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 ring-1 ring-emerald-100" aria-label="Refresh applications">
            <RefreshCw className="h-5 w-5" />
          </button>
        </section>

        <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((status) => {
                const active = filter === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFilter(status)}
                    className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wide ring-1 transition ${
                      active ? "bg-emerald-600 text-white ring-emerald-600" : "bg-slate-50 text-slate-600 ring-slate-100"
                    }`}
                  >
                    {status}
                    <span className="ml-2 rounded-full bg-black/10 px-2 py-0.5 text-[10px]">{counts[status] || 0}</span>
                  </button>
                );
              })}
            </div>
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search applications"
                className="w-full rounded-full bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 ring-1 ring-slate-100 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </section>

        {loading ? <div className="rounded-[28px] bg-white p-5 text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">Loading applications...</div> : null}

        {!loading && !visibleApplications.length ? (
          <div className="rounded-[28px] bg-white p-5 text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">
            No shop applications found.
          </div>
        ) : null}

        <section className="grid gap-3 xl:grid-cols-2">
          {visibleApplications.map((application) => (
            <div key={application.id || application._id} onClick={() => setSelectedId(application.id || application._id)} className="cursor-pointer">
              <ShopApplicationCard
                application={application}
                onOpen={() => setSelectedId(application.id || application._id)}
                onApprove={() => updateStatus(application, "approved")}
                onReject={() => updateStatus(application, "rejected")}
              />
            </div>
          ))}
        </section>

        {selectedApplication ? (
          <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Selected application</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">{selectedApplication.shopName}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">{formatAddressLine(selectedApplication)}</p>
              </div>
              <ShopStatusBadge status={selectedApplication.status} />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Review note</p>
                <textarea
                  value={reviewNote}
                  onChange={(event) => setReviewNote(event.target.value)}
                  className="mt-2 min-h-[96px] w-full rounded-3xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700 outline-none"
                  placeholder="Add an approval or rejection note"
                />
              </div>
              <div className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Application details</p>
                <div className="mt-2 space-y-2 text-sm font-semibold text-slate-600">
                  <p>Phone: {selectedApplication.phone || "-"}</p>
                  <p>WhatsApp: {selectedApplication.whatsapp || "-"}</p>
                  <p>Category: {selectedApplication.category || "-"}</p>
                  <p>Delivery: {selectedApplication.deliveryAvailable ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateStatus(selectedApplication, "approved")}
                className="rounded-full bg-emerald-600 px-4 py-3 text-xs font-black uppercase tracking-wide text-white shadow-sm shadow-emerald-100"
              >
                Approve application
              </button>
              <button
                type="button"
                onClick={() => updateStatus(selectedApplication, "rejected")}
                className="rounded-full bg-rose-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-rose-700 ring-1 ring-rose-100"
              >
                Reject application
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default AdminShopApplicationsPage;
