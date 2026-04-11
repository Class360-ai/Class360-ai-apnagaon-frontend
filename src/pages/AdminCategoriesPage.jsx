import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, RefreshCw, Pencil, Trash2, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminSearchBar from "../components/admin/AdminSearchBar";
import AvailabilityToggle from "../components/admin/AvailabilityToggle";
import CategoryFormModal from "../components/admin/CategoryFormModal";
import {
  ADMIN_CATEGORY_KEY,
  DEFAULT_ADMIN_CATEGORIES,
  loadAdminCollection,
  normalizeCategory,
  removeAdminCollectionItem,
  toggleAdminCollectionItem,
  upsertAdminCollection,
  ADMIN_CATALOG_EVENT,
} from "../utils/adminCatalogStorage";

const CategoryCard = ({ category, onEdit, onDelete, onToggle }) => (
  <article className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-2xl ring-1 ring-slate-100">
          {category.icon || <Tag className="h-5 w-5 text-emerald-600" />}
        </div>
        <div>
          <p className="text-base font-black text-slate-950">{category.name}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">/{category.slug}</p>
        </div>
      </div>
      <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ring-1 ${category.active ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-slate-100 text-slate-500 ring-slate-100"}`}>
        {category.active ? "Visible" : "Hidden"}
      </span>
    </div>

    <div className="mt-3 flex flex-wrap gap-2">
      <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-100">Sort {category.sortOrder || 0}</span>
      <AvailabilityToggle active={Boolean(category.active)} onToggle={onToggle} label={category.active ? "Show" : "Hide"} />
    </div>

    <div className="mt-3 flex flex-wrap gap-2">
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

const AdminCategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const loadCategories = () => {
    setLoading(true);
    const local = loadAdminCollection(ADMIN_CATEGORY_KEY, DEFAULT_ADMIN_CATEGORIES).map(normalizeCategory);
    setCategories(local.sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0)));
    setLoading(false);
  };

  useEffect(() => {
    const timeout = window.setTimeout(loadCategories, 0);
    const sync = () => loadCategories();
    window.addEventListener(ADMIN_CATALOG_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener(ADMIN_CATALOG_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const visibleCategories = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return categories.filter((category) => {
      const matchesFilter = filter === "all" ? true : filter === "active" ? category.active : !category.active;
      const searchable = [category.name, category.slug, category.icon].filter(Boolean).join(" ").toLowerCase();
      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
      return matchesFilter && matchesSearch;
    });
  }, [categories, filter, search]);

  const saveCategory = (form) => {
    const normalized = normalizeCategory({ ...form, id: editingCategory?.id || editingCategory?._id || form.id });
    const next = normalized;
    upsertAdminCollection(ADMIN_CATEGORY_KEY, next, DEFAULT_ADMIN_CATEGORIES, "categories");
    setCategories((current) => {
      const map = new Map();
      [...current, next].forEach((item) => map.set(item.id || item._id, item));
      return Array.from(map.values()).sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
    });
    setModalOpen(false);
    setEditingCategory(null);
  };

  const deleteCategory = (category) => {
    removeAdminCollectionItem(ADMIN_CATEGORY_KEY, category.id || category._id, DEFAULT_ADMIN_CATEGORIES, "categories");
    setCategories((current) => current.filter((item) => (item.id || item._id) !== (category.id || category._id)));
  };

  const toggleCategory = (category) => {
    toggleAdminCollectionItem(ADMIN_CATEGORY_KEY, category.id || category._id, "active", DEFAULT_ADMIN_CATEGORIES, "categories");
    setCategories((current) =>
      current.map((item) => ((item.id || item._id) === (category.id || category._id) ? { ...item, active: !item.active } : item)).sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
    );
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
            <h1 className="mt-1 text-2xl font-black text-slate-950">Categories</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">Control category visibility and ordering.</p>
          </div>
          <button type="button" onClick={loadCategories} className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 ring-1 ring-emerald-100">
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>

        <AdminSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search categories"
          actionLabel="Add Category"
          onAction={() => {
            setEditingCategory(null);
            setModalOpen(true);
          }}
          filters={[
            { label: "All", value: "all" },
            { label: "Visible", value: "active" },
            { label: "Hidden", value: "hidden" },
          ]}
          activeFilter={filter}
          onFilterChange={setFilter}
        />

        {loading ? <div className="rounded-[28px] bg-white p-5 text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">Loading categories...</div> : null}

        {!loading && !visibleCategories.length ? (
          <div className="rounded-[28px] bg-white p-5 text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">No categories found. Add one to organize products better.</div>
        ) : null}

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleCategories.map((category) => (
            <CategoryCard
              key={category.id || category._id || category.slug}
              category={category}
              onEdit={() => {
                setEditingCategory(category);
                setModalOpen(true);
              }}
              onDelete={() => deleteCategory(category)}
              onToggle={() => toggleCategory(category)}
            />
          ))}
        </section>
      </main>

      <CategoryFormModal open={modalOpen} initialData={editingCategory} onClose={() => setModalOpen(false)} onSave={saveCategory} />
    </div>
  );
};

export default AdminCategoriesPage;
