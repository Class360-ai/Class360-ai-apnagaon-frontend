const DeliveryPartner = require("../models/DeliveryPartner");

const SAMPLE_DELIVERY_PARTNERS = [
  {
    name: "Ravi Kumar",
    phone: "9876543210",
    vehicle: "Bike",
    area: "Azamgarh",
    status: "available",
    notes: "Morning shift rider",
  },
  {
    name: "Aman Singh",
    phone: "9876543211",
    vehicle: "Scooter",
    area: "Basti",
    status: "available",
    notes: "Handles nearby village deliveries",
  },
  {
    name: "Shyam Yadav",
    phone: "9876543212",
    vehicle: "Bike",
    area: "Mau",
    status: "busy",
    notes: "Evening route rider",
  },
];

const normalizePartner = (partner) => ({
  name: String(partner.name || "").trim(),
  phone: String(partner.phone || "").trim(),
  vehicle: String(partner.vehicle || "Bike").trim(),
  area: String(partner.area || "").trim(),
  notes: String(partner.notes || "").trim(),
  status: String(partner.status || "available").trim().toLowerCase() === "busy" ? "busy" : "available",
  available: String(partner.status || "available").trim().toLowerCase() !== "busy",
});

const seedDeliveryPartnersInDatabase = async () => {
  const results = [];
  for (const partner of SAMPLE_DELIVERY_PARTNERS) {
    const payload = normalizePartner(partner);
    const saved = await DeliveryPartner.findOneAndUpdate(
      { phone: payload.phone },
      { $set: payload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    results.push(saved);
  }
  return results;
};

module.exports = {
  SAMPLE_DELIVERY_PARTNERS,
  normalizePartner,
  seedDeliveryPartnersInDatabase,
};
