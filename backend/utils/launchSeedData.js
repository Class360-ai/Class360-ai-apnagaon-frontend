const launchSeedData = {
  categories: [
    { id: "cat_grocery", name: "Grocery", slug: "grocery", active: true, sortOrder: 1 },
    { id: "cat_food", name: "Food", slug: "food", active: true, sortOrder: 2 },
    { id: "cat_services", name: "Services", slug: "services", active: true, sortOrder: 3 },
    { id: "cat_water", name: "Water & Gas", slug: "water-gas", active: true, sortOrder: 4 },
  ],
  products: [
    { id: "prod_milk", name: "Fresh Milk", category: "grocery", price: 32, unit: "500 ml", available: true },
    { id: "prod_bread", name: "Bread", category: "grocery", price: 35, unit: "1 pack", available: true },
    { id: "prod_eggs", name: "Eggs", category: "grocery", price: 48, unit: "6 pcs", available: true },
    { id: "prod_tea", name: "Tea", category: "grocery", price: 90, unit: "250 g", available: true },
    { id: "prod_rice", name: "Rice", category: "grocery", price: 124, unit: "1 kg", available: true },
    { id: "prod_oil", name: "Cooking Oil", category: "grocery", price: 168, unit: "1 L", available: true },
  ],
  shops: [
    { id: "shop_1", name: "Sharma Kirana", category: "grocery", area: "Azampur", lat: 26.1, lon: 83.2 },
    { id: "shop_2", name: "Radhe Super Mart", category: "grocery", area: "Sadatpur", lat: 26.11, lon: 83.18 },
    { id: "shop_3", name: "Village Fresh Corner", category: "grocery", area: "Nandlalpur", lat: 26.09, lon: 83.17 },
  ],
  serviceProviders: [
    { id: "srv_1", name: "Raju Electrician", serviceType: "Electrician", area: "Azampur", lat: 26.1, lon: 83.21 },
    { id: "srv_2", name: "Imran Plumber", serviceType: "Plumber", area: "Sadatpur", lat: 26.08, lon: 83.19 },
  ],
  deliveryPartners: [
    { id: "rider_1", name: "Rahul Kumar", phone: "9876543001", area: "Azampur", available: true, vehicleType: "Bike" },
    { id: "rider_2", name: "Salman Ali", phone: "9876543002", area: "Sadatpur", available: true, vehicleType: "Scooter" },
  ],
  offers: [
    { id: "offer_1", title: "Launch 10% Off", offerType: "percent", value: 10, active: true, targetCategory: "grocery" },
    { id: "offer_2", title: "Free Delivery Above ₹199", offerType: "free_delivery", value: 199, active: true },
    { id: "offer_3", title: "Tea Gift", offerType: "gift", value: 1, active: true, targetProduct: "prod_tea" },
  ],
  rewards: [
    { id: "reward_1", title: "₹10 Cashback", type: "cashback", value: 10, active: true },
    { id: "reward_2", title: "Free Tea", type: "gift", value: 1, active: true },
    { id: "reward_3", title: "Free Delivery", type: "free_delivery", value: 1, active: true },
  ],
};

module.exports = launchSeedData;
