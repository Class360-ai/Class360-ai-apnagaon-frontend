import React from "react";
import { CheckCircle2, MapPin, Phone, Store } from "lucide-react";
import ShopStatusBadge from "./ShopStatusBadge";

const ShopApplicationCard = ({ application, onApprove, onReject, onOpen, actionLabel = "Open details" }) => {
  const status = String(application.status || "pending").toLowerCase();

  return (
    <article className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <Store className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-950">{application.shopName}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{application.ownerName || "Owner not set"}</p>
          </div>
        </div>
        <ShopStatusBadge status={status} />
      </div>

      <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-500">
        <p className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-emerald-600" />
          {application.phone || "Phone not added"}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-orange-600" />
          {[application.area, application.city].filter(Boolean).join(", ") || "Area not added"}
        </p>
      </div>

      <p className="mt-3 line-clamp-2 text-sm font-semibold text-slate-600">
        {application.description || application.address || "No description added yet."}
      </p>

      {application.reviewNote ? (
        <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs font-semibold text-slate-600 ring-1 ring-slate-100">
          Admin note: {application.reviewNote}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onOpen} className="rounded-full bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-700 ring-1 ring-slate-100">
          {actionLabel}
        </button>
        {status === "pending" ? (
          <>
            <button
              type="button"
              onClick={onApprove}
              className="rounded-full bg-emerald-600 px-4 py-3 text-xs font-black uppercase tracking-wide text-white shadow-sm shadow-emerald-100"
            >
              <CheckCircle2 className="mr-2 inline h-4 w-4" />
              Approve
            </button>
            <button type="button" onClick={onReject} className="rounded-full bg-rose-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-rose-700 ring-1 ring-rose-100">
              Reject
            </button>
          </>
        ) : null}
      </div>
    </article>
  );
};

export default ShopApplicationCard;
