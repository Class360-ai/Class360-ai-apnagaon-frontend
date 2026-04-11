export const homeTopShortcuts = [
  { id: "grocery", name: "Grocery", icon: "🛒", route: "/grocery" },
  { id: "fresh", name: "Fresh", icon: "🥦", route: "/fresh-produce" },
  { id: "food", name: "Food", icon: "🍔", route: "/food" },
  { id: "services", name: "Services", icon: "🧰", route: "/services" },
  { id: "water", name: "Water", icon: "🚰", route: "/water-gas" },
  { id: "gas", name: "Gas", icon: "🔥", route: "/water-gas" },
  { id: "ride", name: "Ride", icon: "🛺", route: "/rides" },
  { id: "jobs", name: "Jobs", icon: "💼", route: "/jobs" },
];

export const homeTopLocation = {
  label: "HOME",
  address: "Azampur, Azamgarh",
  etaText: "15 min",
};

export const homeHeroPromo = {
  headline: "Daily Essentials at Best Price",
  subline: "Fast delivery in your village",
  meta: "Fresh Produce • Water • Grocery • Services",
  cta: "Explore ApnaGaon",
  route: "/categories",
  highlights: [
    { id: "hero-grocery", icon: "🛒", label: "Grocery" },
    { id: "hero-fresh", icon: "🥬", label: "Fresh" },
    { id: "hero-services", icon: "🧰", label: "Services" },
  ],
};

export const homeMiniPromo = {
  badge: "Top Village Deals",
  title: "Local Shops • Best Offers",
  tag: "Up to 40% Off",
  route: "/categories",
};

export const homeTopDeals = {
  title: "Best Deals in ApnaGaon",
  products: [
    {
      id: "deal-atta",
      name: "Shakti Atta",
      qty: "5kg Pack",
      image: "🌾",
      discount: "22% OFF",
      rating: "4.4",
      price: 265,
      route: "/grocery",
    },
    {
      id: "deal-rice",
      name: "Village Rice",
      qty: "10kg Bag",
      image: "🍚",
      discount: "18% OFF",
      rating: "4.6",
      price: 520,
      route: "/grocery",
    },
    {
      id: "deal-water",
      name: "RO Water Can",
      qty: "20L Can",
      image: "🚰",
      discount: "15% OFF",
      rating: "4.3",
      price: 65,
      route: "/water-gas",
    },
    {
      id: "deal-oil",
      name: "Mustard Oil",
      qty: "1L Bottle",
      image: "🫗",
      discount: "19% OFF",
      rating: "4.2",
      price: 178,
      route: "/grocery",
    },
    {
      id: "deal-snacks",
      name: "Evening Snacks",
      qty: "Combo Box",
      image: "🥨",
      discount: "25% OFF",
      rating: "4.5",
      price: 145,
      route: "/food",
    },
  ],
};
