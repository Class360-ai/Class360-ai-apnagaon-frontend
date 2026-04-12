import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Truck } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import OrderStatusBadge from "../components/OrderStatusBadge";
import DeliveryPartnerList from "../components/admin/delivery/DeliveryPartnerList";
import DeliveryPartnerForm from "../components/admin/delivery/DeliveryPartnerForm";
import DeliveryAssignmentCard from "../components/admin/delivery/DeliveryAssignmentCard";
import { authAPI, deliveryPartnersAPI, ordersAPI, safeFetch } from "../utils/api";
import { formatAddressLine } from "../utils/locationHelpers";
import { formatPrice } from "../utils/helpers";
import { normalizeDeliveryPartner } from "../utils/deliveryPartnerStorage";

const filterModes = ["all", "unassigned", "assigned", "active"];

const callPhone = (phone) => {
  if (!phone) return false;
  window.location.href = `tel:${String(phone).replace(/\D/g, "")}`;
  return true;
};

const toArray = (data, keys = []) => {
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
};

const AdminDeliveryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const section = location.pathname.includes("/orders") ? "orders" : "dashboard";
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    const [orderData, partnerData, userData] = await Promise.all([
      safeFetch(() => ordersAPI.getAll(), []),
      safeFetch(() => deliveryPartnersAPI.getAll(), []),
      safeFetch(() => authAPI.users(), []),
    ]);

    const orderList = toArray(orderData, ["orders"]);
    const partnerList = toArray(partnerData, ["deliveryPartners", "partners"]);
    const userList = Array.isArray(userData) ? userData : [];

    const basePartners = partnerList.length ? partnerList : userList;
    const normalizedPartners = basePartners.map(normalizeDeliveryPartner).filter(Boolean);
    const partnerCount = new Map();

    orderList.forEach((order) => {
      const key = String(order.deliveryPartnerId || order.riderId || "");
      if (key) partnerCount.set(key, (partnerCount.get(key) || 0) + 1);
    });

    setPartners(normalizedPartners.map((partner) => ({ ...partner, activeOrdersCount: partnerCount.get(String(partner.id)) || 0 })));
    setOrders(Array.isArray(orderList) ? orderList : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const createPartner = async (payload) => {
    const created = await deliveryPartnersAPI.create(payload);
    await load();
    return created;
  };

  const seedPartners = async () => {
    const seeded = await safeFetch(() => deliveryPartnersAPI.seed(), null);
    if (!seeded) {
      throw new Error("Unable to seed delivery partners");
    }
    await load();
    return seeded;
  };

  const stats = useMemo(() => {
    const unassigned = orders.filter((order) => !order.deliveryPartnerId && !order.riderId);
    const assigned = orders.filter((order) => order.deliveryPartnerId || order.riderId);
    const active = orders.filter((order) => ["assigned", "picked_up", "on_the_way", "out_for_delivery"].includes(order.status));
    return [
      { label: "Orders", value: orders.length },
      { label: "Unassigned", value: unassigned.length },
      { label: "Assigned", value: assigned.length },
      { label: "Active", value: active.length },
    ];
  }, [orders]);

  const visibleOrders = useMemo(() => {
    if (filter === "unassigned") return orders.filter((order) => !order.deliveryPartnerId && !order.riderId);
    if (filter === "assigned") return orders.filter((order) => order.deliveryPartnerId || order.riderId);
    if (filter === "active") return orders.filter((order) => ["assigned", "picked_up", "on_the_way", "out_for_delivery"].includes(order.status));
    return orders;
  }, [filter, orders]);

  const selectedOrder = useMemo(
    () => orders.find((order) => String(order.id || order._id || order.orderId) === String(selectedOrderId)) || null,
    [orders, selectedOrderId]
  );

  useEffect(() => {
    if (!selectedOrder && visibleOrders[0]) {
      setSelectedOrderId(visibleOrders[0].id || visibleOrders[0]._id || visibleOrders[0].orderId);
    }
  }, [selectedOrder, visibleOrders]);

  useEffect(() => {
    if (!selectedOrder) return;
    setSelectedPartnerId(String(selectedOrder.deliveryPartnerId || selectedOrder.riderId || ""));
  }, [selectedOrder]);

  const assignRider = async () => {
    if (!selectedOrder || !selectedPartnerId) return;
    const partner = partners.find((item) => String(item.id) === String(selectedPartnerId));
    if (!partner) return;
    const assigned = await safeFetch(
      () =>
        ordersAPI.assignDeliveryPartner(selectedOrder._id || selectedOrder.id || selectedOrder.orderId, {
          deliveryPartnerId: partner.id,
          riderName: partner.name,
          riderPhone: partner.phone,
        }),
      null
    );
    if (assigned) {
      await load();
      setSelectedOrderId(assigned.id || assigned._id || assigned.orderId);
    }
  };

  const updateStatus = async (status) => {
    if (!selectedOrder) return;
    await safeFetch(() => ordersAPI.updateStatus(selectedOrder._id || selectedOrder.id || selectedOrder.orderId, status), null);
    load();
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <section className="flex items-center gap-3 rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <button type="button" onClick={() => navigate(-1)} className="rounded-2xl bg-slate-50 p-3 text-slate-700 ring-1 ring-slate-100" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Delivery assignment</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">{section === "orders" ? "Delivery orders" : "Assign riders"}</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">Match orders to delivery partners and move them through delivery status.</p>
          </div>
          <button type="button" onClick={load} className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 ring-1 ring-emerald-100" aria-label="Refresh">
            <RefreshCw className="h-5 w-5" />
          </button>
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((card) => (
            <div key={card.label} className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">{card.label}</p>
              <p className="mt-1 text-2xl font-black text-slate-950">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <DeliveryPartnerForm onCreate={createPartner} onSeed={seedPartners} />

            <div className="flex flex-wrap gap-2 rounded-[28px] bg-white p-3 shadow-sm ring-1 ring-slate-100">
              {filterModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFilter(mode)}
                  className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wide ring-1 ${
                    filter === mode ? "bg-emerald-600 text-white ring-emerald-600" : "bg-slate-50 text-slate-600 ring-slate-100"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {loading ? <div className="rounded-[24px] bg-white p-5 text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">Loading delivery data...</div> : null}

            {!loading && !visibleOrders.length ? (
              <div className="rounded-[24px] bg-white p-5 text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">No delivery orders found.</div>
            ) : null}

            <div className="grid gap-3">
              {visibleOrders.map((order) => (
                <DeliveryAssignmentCard
                  key={order.id || order._id || order.orderId}
                  order={order}
                  partner={partners.find((item) => String(item.id) === String(order.deliveryPartnerId || order.riderId))}
                  onOpen={() => setSelectedOrderId(order.id || order._id || order.orderId)}
                  onCallCustomer={() => callPhone(order.phone || order.customer?.phone)}
                  onCallShop={() => callPhone(order.shopPhone || order.storePhone)}
                  onAssign={() => setSelectedOrderId(order.id || order._id || order.orderId)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">Delivery partners</p>
                  <h2 className="mt-1 text-lg font-black text-slate-950">Assign a rider</h2>
                </div>
                <Truck className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="mt-4">
                <DeliveryPartnerList partners={partners} selectedId={selectedPartnerId} onSelect={(partner) => setSelectedPartnerId(partner.id)} />
              </div>
            </section>

            <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">Selected order</p>
                  <h2 className="mt-1 text-lg font-black text-slate-950">{selectedOrder ? `#${selectedOrder.orderId || selectedOrder.id}` : "No order selected"}</h2>
                </div>
                <OrderStatusBadge status={selectedOrder?.status || "placed"} />
              </div>
              {selectedOrder ? (
                <>
                  <div className="mt-3 rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
                    <p className="text-sm font-black text-slate-950">{selectedOrder.customerName || selectedOrder.customer?.name || "Customer"}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{formatAddressLine(selectedOrder.address || {})}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{selectedOrder.paymentMethod || "Payment pending"} · {formatPrice(selectedOrder.total || selectedOrder.totals?.total || 0)}</p>
                  </div>

                  <div className="mt-4 rounded-[24px] bg-slate-50 p-3 ring-1 ring-slate-100">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">Choose rider</p>
                    <select
                      value={selectedPartnerId}
                      onChange={(event) => setSelectedPartnerId(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none"
                    >
                      <option value="">Select a delivery partner</option>
                      {partners.map((partner) => (
                        <option key={partner.id} value={partner.id}>
                          {partner.name} {partner.phone ? `· ${partner.phone}` : ""}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={assignRider}
                      disabled={!selectedPartnerId}
                      className="mt-3 w-full rounded-full bg-emerald-600 px-4 py-3 text-xs font-black uppercase tracking-wide text-white shadow-sm shadow-emerald-100 disabled:bg-emerald-300"
                    >
                      Assign rider
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => updateStatus("assigned")} className="rounded-full bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-700 ring-1 ring-slate-100">
                      Assigned
                    </button>
                    <button type="button" onClick={() => updateStatus("picked_up")} className="rounded-full bg-orange-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-orange-700 ring-1 ring-orange-100">
                      Picked up
                    </button>
                    <button type="button" onClick={() => updateStatus("on_the_way")} className="rounded-full bg-sky-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-sky-700 ring-1 ring-sky-100">
                      On the way
                    </button>
                    <button type="button" onClick={() => updateStatus("delivered")} className="rounded-full bg-emerald-600 px-4 py-3 text-xs font-black uppercase tracking-wide text-white shadow-sm shadow-emerald-100">
                      Delivered
                    </button>
                    <button type="button" onClick={() => updateStatus("failed_delivery")} className="rounded-full bg-rose-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-rose-700 ring-1 ring-rose-100">
                      Failed
                    </button>
                  </div>

                  <div className="mt-4 rounded-[24px] bg-emerald-50 p-4 ring-1 ring-emerald-100">
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Partner assignment</p>
                    <p className="mt-1 text-sm font-semibold text-emerald-900">
                      {selectedPartnerId ? `Selected rider: ${partners.find((partner) => String(partner.id) === String(selectedPartnerId))?.name || "Partner"}` : "Pick a rider from the list to assign this order."}
                    </p>
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-[24px] bg-slate-50 p-4 text-sm font-semibold text-slate-500 ring-1 ring-slate-100">Select an order to assign or update delivery progress.</div>
              )}
            </section>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminDeliveryPage;
