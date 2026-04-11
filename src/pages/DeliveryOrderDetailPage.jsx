import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPinned, Phone, Store } from "lucide-react";
import DeliveryLayout from "../components/DeliveryLayout";
import DeliveryStatusActions from "../components/delivery/DeliveryStatusActions";
import DeliveryTrackingCard from "../components/DeliveryTrackingCard";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { ordersAPI, safeFetch } from "../utils/api";
import { getLocalOrderById, updateLocalOrderStatus, ORDER_UPDATED_EVENT } from "../utils/orderStorage";
import { formatAddressLine, openDirections } from "../utils/locationHelpers";
import { formatPrice } from "../utils/helpers";

const callPhone = (phone) => {
  if (!phone) return false;
  window.location.href = `tel:${String(phone).replace(/\D/g, "")}`;
  return true;
};

const DeliveryOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const backend = await safeFetch(() => ordersAPI.getById(id), null);
      const local = getLocalOrderById(id);
      if (!mounted) return;
      setOrder(backend || local || null);
    };
    load();
    const sync = (event) => {
      const next = event.detail;
      if (!next) return;
      if (String(next.id || next._id || next.orderId) !== String(id)) return;
      setOrder(next);
    };
    window.addEventListener(ORDER_UPDATED_EVENT, sync);
    window.addEventListener("storage", load);
    return () => {
      mounted = false;
      window.removeEventListener(ORDER_UPDATED_EVENT, sync);
      window.removeEventListener("storage", load);
    };
  }, [id]);

  const displayOrder = useMemo(() => order || { status: "placed", trackingSteps: [] }, [order]);

  const updateStatus = async (status) => {
    const next = await safeFetch(() => ordersAPI.updateStatus(id, status), null);
    if (next) {
      setOrder(next);
      return;
    }
    const local = updateLocalOrderStatus(id, status, status);
    if (local) setOrder(local);
  };

  const shopLocation = displayOrder.shopLocation || {
    lat: displayOrder.shopLat,
    lon: displayOrder.shopLon,
  };

  return (
    <DeliveryLayout>
      <div className="space-y-4">
        <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => navigate(-1)} className="rounded-2xl bg-slate-50 p-3 text-slate-700 ring-1 ring-slate-100" aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <OrderStatusBadge status={displayOrder.status || "placed"} />
          </div>
          <h1 className="mt-4 text-2xl font-black text-slate-950">Order #{displayOrder.orderId || displayOrder.id || id}</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">Delivery partner view with pickup, customer, and status actions.</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Customer</p>
              <p className="mt-1 text-sm font-black text-slate-950">{displayOrder.customerName || displayOrder.customer?.name || "Customer"}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{formatAddressLine(displayOrder.address || {})}</p>
              {displayOrder.phone ? (
                <button type="button" onClick={() => callPhone(displayOrder.phone)} className="mt-3 rounded-full bg-white px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-700 ring-1 ring-slate-200">
                  <Phone className="mr-2 inline h-4 w-4 text-orange-600" />
                  Call customer
                </button>
              ) : null}
            </div>
            <div className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Pickup shop</p>
              <p className="mt-1 text-sm font-black text-slate-950">{displayOrder.shopName || displayOrder.shop?.name || "Shop not set"}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{displayOrder.shopAddress || displayOrder.shop?.address || "Pickup address not set"}</p>
              {displayOrder.shopPhone ? (
                <button type="button" onClick={() => callPhone(displayOrder.shopPhone)} className="mt-3 rounded-full bg-white px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-700 ring-1 ring-slate-200">
                  <Store className="mr-2 inline h-4 w-4 text-emerald-600" />
                  Call shop
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => openDirections(shopLocation)}
              className="rounded-full bg-emerald-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-emerald-100"
            >
              <MapPinned className="mr-2 inline h-4 w-4" />
              Directions to shop
            </button>
            <button
              type="button"
              onClick={() => openDirections(displayOrder.deliveryLocation || displayOrder.address, shopLocation)}
              className="rounded-full bg-white px-4 py-4 text-sm font-black text-slate-900 ring-1 ring-slate-100"
            >
              Route to customer
            </button>
          </div>
        </section>

        <DeliveryTrackingCard order={displayOrder} />

        <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">Delivery actions</p>
          <h2 className="mt-1 text-lg font-black text-slate-950">Update the order progress</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">{formatPrice(displayOrder.total || displayOrder.totals?.total || 0)} · {displayOrder.paymentMethod || "Payment pending"}</p>
          <div className="mt-4">
            <DeliveryStatusActions onChange={updateStatus} disabled={!displayOrder} />
          </div>
        </section>
      </div>
    </DeliveryLayout>
  );
};

export default DeliveryOrderDetailPage;
