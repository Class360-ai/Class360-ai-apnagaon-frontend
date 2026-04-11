import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, RefreshCw, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminSearchBar from "../components/admin/AdminSearchBar";
import AvailabilityToggle from "../components/admin/AvailabilityToggle";
import OfferFormModal from "../components/admin/OfferFormModal";
import {
  ADMIN_CATALOG_EVENT,
  ADMIN_OFFER_KEY,
  DEFAULT_ADMIN_OFFERS,
  loadAdminCollection,
  normalizeOffer,
  removeAdminCollectionItem,
  toggleAdminCollectionItem,
  upsertAdminCollection,
} from "../utils/adminCatalogStorage";

const OFFER_TYPE_LABEL = {
  flat: "Flat",
  percent: "Percent",
  free_delivery: "Free delivery",
  gift: "Gift",
};

const OfferCard = ({ offer, onEdit, onDelete, onToggle }) => (
  <article className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-base font-black text-slate-950">{offer.title}</p>
        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">{offer.code || "No code"}</p>
      </div>
      <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ring-1 ${offer.active ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-slate-100 text-slate-500 ring-slate-100"}`}>
        {offer.active ? "Active" : "Inactive"}
      </span>
    </div>

    <div className="mt-3 grid gap-2 rounded-[24px] bg-slate-50 p-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-3">
        <span>Type</span>
        <span className="font-black text-slate-950">{OFFER_TYPE_LABEL[offer.offerType] || offer.offerType}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span>Value</span>
        <span className="font-black text-slate-950">{offer.offerType === "percent" ? `${offer.value}%` : `₹${offer.value}`}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span>Valid till</span>
        <span className="font-black text-slate-950">{offer.validTill || "No expiry"}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span>Target</span>
        <span className="font-black text-slate-950">{offer.targetCategory || offer.targetProduct || "All"}</span>
      </div>
      {offer.bannerText ? <p className="text-xs font-semibold leading-5 text-slate-500">{offer.bannerText}</p> : null}
    </div>

    <div className="mt-3 flex flex-wrap gap-2">
      <AvailabilityToggle active={Boolean(offer.active)} onToggle={onToggle} label={offer.active ? "Active" : "Inactive"} />
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

const AdminOffersPage = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  const loadOffers = () => {
    setLoading(true);
    const local = loadAdminCollection(ADMIN_OFFER_KEY, DEFAULT_ADMIN_OFFERS).map(normalizeOffer);
    setOffers(local);
    setLoading(false);
  };

  useEffect(() => {
    const timeout = window.setTimeout(loadOffers, 0);
    const sync = () => loadOffers();
    window.addEventListener(ADMIN_CATALOG_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener(ADMIN_CATALOG_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const visibleOffers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return offers.filter((offer) => {
      const matchesFilter = filter === "all" ? true : filter === "active" ? offer.active : !offer.active;
      const searchable = [offer.title, offer.code, offer.offerType, offer.targetCategory, offer.targetProduct, offer.bannerText]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
      return matchesFilter && matchesSearch;
    });
  }, [filter, offers, search]);

  const saveOffer = (form) => {
    const normalized = normalizeOffer({ ...form, id: editingOffer?.id || editingOffer?._id || form.id });
    upsertAdminCollection(ADMIN_OFFER_KEY, normalized, DEFAULT_ADMIN_OFFERS, "offers");
    setOffers((current) => {
      const map = new Map();
      [...current, normalized].forEach((item) => map.set(item.id || item._id, item));
      return Array.from(map.values());
    });
    setModalOpen(false);
    setEditingOffer(null);
  };

  const deleteOffer = (offer) => {
    removeAdminCollectionItem(ADMIN_OFFER_KEY, offer.id || offer._id, DEFAULT_ADMIN_OFFERS, "offers");
    setOffers((current) => current.filter((item) => (item.id || item._id) !== (offer.id || offer._id)));
  };

  const toggleOffer = (offer) => {
    toggleAdminCollectionItem(ADMIN_OFFER_KEY, offer.id || offer._id, "active", DEFAULT_ADMIN_OFFERS, "offers");
    setOffers((current) => current.map((item) => ((item.id || item._id) === (offer.id || offer._id) ? { ...item, active: !item.active } : item)));
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
            <h1 className="mt-1 text-2xl font-black text-slate-950">Offers</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">Manage discounts, banners, and reward offers.</p>
          </div>
          <button type="button" onClick={loadOffers} className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 ring-1 ring-emerald-100">
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>

        <AdminSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search offers"
          actionLabel="Add Offer"
          onAction={() => {
            setEditingOffer(null);
            setModalOpen(true);
          }}
          filters={[
            { label: "All", value: "all" },
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ]}
          activeFilter={filter}
          onFilterChange={setFilter}
        />

        {loading ? <div className="rounded-[28px] bg-white p-5 text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">Loading offers...</div> : null}

        {!loading && !visibleOffers.length ? (
          <div className="rounded-[28px] bg-white p-5 text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">No offers found. Create a discount or free-delivery offer to start.</div>
        ) : null}

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleOffers.map((offer) => (
            <OfferCard
              key={offer.id || offer._id || offer.code || offer.title}
              offer={offer}
              onEdit={() => {
                setEditingOffer(offer);
                setModalOpen(true);
              }}
              onDelete={() => deleteOffer(offer)}
              onToggle={() => toggleOffer(offer)}
            />
          ))}
        </section>
      </main>

      <OfferFormModal open={modalOpen} initialData={editingOffer} onClose={() => setModalOpen(false)} onSave={saveOffer} />
    </div>
  );
};

export default AdminOffersPage;
