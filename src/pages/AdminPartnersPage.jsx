import React, { useCallback, useEffect, useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { partnersAPI, safeFetch, servicePartnersAPI } from "../utils/api";

const statuses = ["pending", "approved", "rejected", "suspended"];

const StatusPill = ({ status }) => <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase text-slate-700">{status}</span>;

const AdminPartnersPage = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [shopData, serviceData] = await Promise.all([
      safeFetch(() => partnersAPI.adminList(), []),
      safeFetch(() => servicePartnersAPI.adminList(), []),
    ]);
    setShops(Array.isArray(shopData) ? shopData : []);
    setServices(Array.isArray(serviceData) ? serviceData : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const updateShop = async (id, status) => {
    await safeFetch(() => partnersAPI.updateStatus(id, status), null);
    load();
  };
  const updateService = async (id, status) => {
    await safeFetch(() => servicePartnersAPI.updateStatus(id, status), null);
    load();
  };

  const renderCard = (item, type) => (
    <article key={item._id || item.id} className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-slate-950">{item.shopName || item.name}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">{item.ownerName || item.serviceType} / {item.phone}</p>
          <p className="mt-2 text-xs font-bold text-slate-500">{item.area || item.address || "No area added"}</p>
        </div>
        <StatusPill status={item.status} />
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {statuses.map((status) => (
          <button key={status} type="button" onClick={() => type === "shop" ? updateShop(item._id || item.id, status) : updateService(item._id || item.id, status)} className="shrink-0 rounded-full bg-slate-50 px-3 py-2 text-[11px] font-black capitalize text-slate-700 ring-1 ring-slate-200">{status}</button>
        ))}
      </div>
    </article>
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-28 pt-4">
      <main className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center gap-3 rounded-[24px] bg-white p-3 shadow-sm ring-1 ring-slate-100">
          <button type="button" onClick={() => navigate(-1)} className="rounded-2xl bg-slate-50 p-3 text-slate-700 ring-1 ring-slate-100"><ArrowLeft className="h-5 w-5" /></button>
          <div className="min-w-0 flex-1"><p className="text-xs font-black uppercase tracking-wide text-emerald-700">Admin</p><h1 className="text-xl font-black text-slate-950">Partner Approvals</h1></div>
          <button type="button" onClick={load} className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 ring-1 ring-emerald-100"><RefreshCw className="h-5 w-5" /></button>
        </div>
        {loading ? <p className="rounded-[24px] bg-white p-5 text-sm font-bold text-slate-500">Loading partners...</p> : null}
        <section className="grid gap-3 md:grid-cols-2">
          {[...shops.map((item) => ({ ...item, type: "shop" })), ...services.map((item) => ({ ...item, type: "service" }))].map((item) => renderCard(item, item.type))}
        </section>
      </main>
    </div>
  );
};

export default AdminPartnersPage;
