// Master category configuration for ApnaGaon

export const CATEGORY_TYPES = {
  PRODUCT: "product",
  SERVICE: "service"
};

export const categories = {
  // Daily Needs - Products
  grocery: {
    id: "grocery",
    slug: "grocery",
    name: "Grocery",
    nameHi: "किराना",
    type: CATEGORY_TYPES.PRODUCT,
    emoji: "🛒",
    color: "from-green-400 to-green-600",
    description: "Essential groceries and staples",
  },
  
  freshProduce: {
    id: "fresh-produce",
    slug: "fresh-produce",
    name: "Fresh Produce",
    nameHi: "ताजी सब्जियां",
    type: CATEGORY_TYPES.PRODUCT,
    emoji: "🥬",
    color: "from-green-300 to-green-500",
    description: "Fresh vegetables and fruits",
  },
  
  dairyMilk: {
    id: "dairy-milk",
    slug: "dairy-milk",
    name: "Dairy & Milk",
    nameHi: "डेयरी और दूध",
    type: CATEGORY_TYPES.PRODUCT,
    emoji: "🥛",
    color: "from-blue-300 to-blue-500",
    description: "Dairy products and milk",
  },
  
  waterGas: {
    id: "water-gas",
    slug: "water-gas",
    name: "Water & Gas",
    nameHi: "पानी और गैस",
    type: CATEGORY_TYPES.PRODUCT,
    emoji: "💧",
    color: "from-cyan-300 to-cyan-500",
    description: "Water and gas delivery",
  },
  
  medicines: {
    id: "medicines",
    slug: "medicines",
    name: "Medicines",
    nameHi: "दवाइयां",
    type: CATEGORY_TYPES.PRODUCT,
    emoji: "💊",
    color: "from-red-300 to-red-500",
    description: "Over the counter medicines",
  },
  
  food: {
    id: "food",
    slug: "food",
    name: "Food & Beverages",
    nameHi: "भोजन और पेय",
    type: CATEGORY_TYPES.PRODUCT,
    emoji: "🍕",
    color: "from-orange-300 to-orange-500",
    description: "Food, beverages, snacks and drinks",
  },
  
  // Food Subcategories
  coldDrinks: {
    id: "cold-drinks",
    slug: "cold-drinks",
    name: "Cold Drinks",
    nameHi: "कोल्ड ड्रिंक्स",
    type: CATEGORY_TYPES.PRODUCT,
    emoji: "🥤",
    color: "from-blue-300 to-cyan-400",
    description: "Refreshing cold drinks and beverages",
    parentCategory: "food",
  },
  
  fastFood: {
    id: "fast-food",
    slug: "fast-food",
    name: "Fast Food",
    nameHi: "फास्ट फूड",
    type: CATEGORY_TYPES.PRODUCT,
    emoji: "🍔",
    color: "from-red-300 to-pink-400",
    description: "Quick and delicious fast food",
    parentCategory: "food",
  },
  
  snacks: {
    id: "snacks",
    slug: "snacks",
    name: "Snacks",
    nameHi: "नाश्ता",
    type: CATEGORY_TYPES.PRODUCT,
    emoji: "🍿",
    color: "from-yellow-300 to-orange-400",
    description: "Crispy snacks and namkeen",
    parentCategory: "food",
  },
  
  teaBreakfast: {
    id: "tea-breakfast",
    slug: "tea-breakfast",
    name: "Tea & Breakfast",
    nameHi: "चाय और नाश्ता",
    type: CATEGORY_TYPES.PRODUCT,
    emoji: "☕",
    color: "from-amber-300 to-yellow-400",
    description: "Tea, coffee and breakfast items",
    parentCategory: "food",
  },
  
  sweets: {
    id: "sweets",
    slug: "sweets",
    name: "Sweets",
    nameHi: "मिठाइयाँ",
    type: CATEGORY_TYPES.PRODUCT,
    emoji: "🍬",
    color: "from-pink-300 to-rose-400",
    description: "Delicious traditional sweets",
    parentCategory: "food",
  },
  
  household: {
    id: "household",
    slug: "household",
    name: "Household",
    nameHi: "घरेलू",
    type: CATEGORY_TYPES.PRODUCT,
    emoji: "🧹",
    color: "from-purple-300 to-purple-500",
    description: "Household essentials",
  },
  stationery: {
    id: "stationery",
    slug: "stationery",
    name: "Stationery",
    nameHi: "स्टेशनरी",
    type: CATEGORY_TYPES.PRODUCT,
    emoji: "📝",
    color: "from-indigo-300 to-indigo-500",
    description: "School and home stationery items",
  },
  personalCare: {
    id: "personal-care",
    slug: "personal-care",
    name: "Personal Care",
    nameHi: "व्यक्तिगत देखभाल",
    type: CATEGORY_TYPES.PRODUCT,
    emoji: "🧴",
    color: "from-pink-300 to-pink-500",
    description: "Daily personal care essentials",
  },
  
  // Smart Village - Services
  tailorSalon: {
    id: "tailor-salon",
    slug: "tailor-salon",
    name: "Tailor & Salon",
    nameHi: "दरजी और सैलून",
    type: CATEGORY_TYPES.SERVICE,
    emoji: "💇",
    color: "from-pink-400 to-pink-600",
    description: "Tailoring and beauty services",
  },
  teachers: {
    id: "teachers",
    slug: "teachers",
    name: "Teachers & Coaching",
    nameHi: "शिक्षक और कोचिंग",
    type: CATEGORY_TYPES.SERVICE,
    emoji: "👨‍🏫",
    color: "from-yellow-400 to-yellow-600",
    description: "Tuition and coaching services",
  },
  
  jobs: {
    id: "jobs",
    slug: "jobs",
    name: "Job Opportunities",
    nameHi: "नौकरी के अवसर",
    type: CATEGORY_TYPES.SERVICE,
    emoji: "💼",
    color: "from-indigo-400 to-indigo-600",
    description: "Local job postings",
  },
  
  electrician: {
    id: "electrician",
    slug: "electrician",
    name: "Electrician",
    nameHi: "बिजली मिस्त्री",
    type: CATEGORY_TYPES.SERVICE,
    emoji: "⚡",
    color: "from-yellow-300 to-yellow-500",
    description: "Electrical repair services",
  },
  
  plumber: {
    id: "plumber",
    slug: "plumber",
    name: "Plumber",
    nameHi: "प्लंबर",
    type: CATEGORY_TYPES.SERVICE,
    emoji: "🔧",
    color: "from-blue-400 to-blue-600",
    description: "Plumbing services",
  },
  
  carpenter: {
    id: "carpenter",
    slug: "carpenter",
    name: "Carpenter",
    nameHi: "बढ़ई",
    type: CATEGORY_TYPES.SERVICE,
    emoji: "🪚",
    color: "from-amber-400 to-amber-600",
    description: "Carpentry services",
  },
  
  ride: {
    id: "ride",
    slug: "ride",
    name: "Ride Sharing",
    nameHi: "राइड शेयरिंग",
    type: CATEGORY_TYPES.SERVICE,
    emoji: "🚗",
    color: "from-teal-400 to-teal-600",
    description: "Local ride sharing",
  },
};

export const getAllCategories = () => Object.values(categories);

export const getDailyNeedsCategories = () => 
  Object.values(categories).filter(c => c.type === CATEGORY_TYPES.PRODUCT);

export const getSmartVillageCategories = () => 
  Object.values(categories).filter(c => c.type === CATEGORY_TYPES.SERVICE);

export const getCategoryBySlug = (slug) => {
  return Object.values(categories).find(c => c.slug === slug);
};

// Quick navigation chips for home page
export const quickChips = [
  { label: "Milk", labelHi: "दूध", target: "/dairy-milk", emoji: "🥛" },
  { label: "Vegetables", labelHi: "सब्जियां", target: "/fresh-produce", emoji: "🥬" },
  { label: "Teachers", labelHi: "शिक्षक", target: "/teachers", emoji: "👨‍🏫" },
  { label: "Jobs", labelHi: "नौकरी", target: "/jobs", emoji: "💼" },
  { label: "Gas", labelHi: "गैस", target: "/water-gas", emoji: "💧" },
  { label: "Medicines", labelHi: "दवाई", target: "/medicines", emoji: "💊" },
  { label: "Food", labelHi: "खाना", target: "/food", emoji: "🍕" },
  { label: "Ride", labelHi: "राइड", target: "/ride", emoji: "🚗" },
  { label: "Tailor", labelHi: "दरजी", target: "/tailor-salon", emoji: "💇" },
];
