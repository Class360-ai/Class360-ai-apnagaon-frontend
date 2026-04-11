const makeItem = (id, name, subtitle, badge, actionLabel, actionType, icon = "🧺", phone = "") => ({
  id,
  name,
  subtitle,
  badge,
  actionLabel,
  actionType,
  icon,
  phone,
});

const makeSection = (id, title, layout, items) => ({
  id,
  title,
  layout,
  items,
});

export const categoriesData = [
  {
    id: "grocery",
    name: "Grocery",
    icon: "🛒",
    subtitle: "Daily essentials",
    sections: [
      makeSection("grocery-popular", "Popular in Village", "horizontal", [
        makeItem("atta", "Atta", "5kg packs", "Popular", "Add", "cart", "🌾"),
        makeItem("rice", "Rice", "Premium grain", "Order", "Add", "cart", "🍚"),
        makeItem("oil", "Oil", "Mustard and refined", "Order", "Add", "cart", "🫗"),
        makeItem("salt", "Salt", "Iodized packs", "Popular", "Add", "cart", "🧂"),
      ]),
      makeSection("grocery-trending", "New & Trending", "grid", [
        makeItem("biscuits", "Biscuits", "Family packs", "New", "Add", "cart", "🍪"),
        makeItem("tea", "Tea", "Leaf and dust", "Popular", "Add", "cart", "🍵"),
        makeItem("sugar", "Sugar", "Fine crystal", "Order", "Add", "cart", "🍬"),
        makeItem("snacks", "Snacks", "Mix namkeen", "New", "Add", "cart", "🥨"),
      ]),
      makeSection("grocery-used", "Frequently Used", "mini-horizontal", [
        makeItem("bread", "Bread", "Fresh loaf", "Daily", "Add", "cart", "🍞"),
        makeItem("eggs", "Eggs", "Farm fresh", "Order", "Add", "cart", "🥚"),
        makeItem("masala", "Masala", "Kitchen blend", "Daily", "Add", "cart", "🌶️"),
        makeItem("pulses", "Pulses", "Protein rich", "Popular", "Add", "cart", "🫘"),
      ]),
      makeSection("grocery-quick", "Quick Orders", "horizontal", [
        makeItem("quick-1", "Morning Basket", "Daily quick set", "Quick", "Order", "whatsapp", "⚡"),
        makeItem("quick-2", "Family Combo", "Weekly refill", "Best Value", "Order", "whatsapp", "📦"),
        makeItem("quick-3", "Repeat Last", "Based on last cart", "Fast", "Order", "view", "🔁"),
      ]),
    ],
  },
  {
    id: "fresh-produce",
    name: "Fresh Produce",
    icon: "🥬",
    subtitle: "Farm fresh picks",
    sections: [
      makeSection("fp-popular", "Popular in Village", "horizontal", [
        makeItem("potato", "Potato", "Daily use", "Popular", "Add", "cart", "🥔"),
        makeItem("onion", "Onion", "Fresh lot", "Order", "Add", "cart", "🧅"),
        makeItem("tomato", "Tomato", "Juicy red", "Order", "Add", "cart", "🍅"),
        makeItem("green-chilli", "Green Chilli", "Spicy fresh", "Popular", "Add", "cart", "🌶️"),
      ]),
      makeSection("fp-new", "New & Trending", "grid", [
        makeItem("spinach", "Spinach", "Leaf bunch", "New", "Add", "cart", "🥗"),
        makeItem("cauliflower", "Cauliflower", "Seasonal", "New", "Add", "cart", "🥦"),
        makeItem("brinjal", "Brinjal", "Tender fresh", "Order", "Add", "cart", "🍆"),
        makeItem("cabbage", "Cabbage", "Crisp head", "Order", "Add", "cart", "🥬"),
      ]),
      makeSection("fp-used", "Frequently Used", "mini-horizontal", [
        makeItem("banana", "Banana", "Dozen", "Daily", "Add", "cart", "🍌"),
        makeItem("apple", "Apple", "Premium", "Popular", "Add", "cart", "🍎"),
        makeItem("lemon", "Lemon", "Sour fresh", "Order", "Add", "cart", "🍋"),
        makeItem("coriander", "Coriander", "Herb bunch", "Daily", "Add", "cart", "🌿"),
      ]),
      makeSection("fp-quick", "Quick Orders", "horizontal", [
        makeItem("fpq1", "Fresh Basket", "Mixed veggies", "Quick", "Order", "whatsapp", "🧺"),
        makeItem("fpq2", "Fruit Box", "Season fruits", "Popular", "Order", "whatsapp", "🍇"),
      ]),
    ],
  },
  {
    id: "dairy-milk",
    name: "Dairy & Milk",
    icon: "🥛",
    subtitle: "Dairy essentials",
    sections: [
      makeSection("dm-popular", "Popular in Village", "horizontal", [
        makeItem("milk-packet", "Milk Packet", "500ml/1L", "Popular", "Add", "cart", "🥛"),
        makeItem("curd", "Curd", "Fresh cup", "Order", "Add", "cart", "🍶"),
        makeItem("paneer", "Paneer", "Fresh block", "Order", "Add", "cart", "🧀"),
        makeItem("butter", "Butter", "Creamy", "Popular", "Add", "cart", "🧈"),
      ]),
      makeSection("dm-new", "New & Trending", "grid", [
        makeItem("lassi", "Lassi", "Chilled", "New", "Add", "cart", "🥤"),
        makeItem("ghee", "Ghee", "Village made", "Order", "Add", "cart", "🫙"),
        makeItem("flavoured-milk", "Flavoured Milk", "Kids choice", "New", "Add", "cart", "🧋"),
        makeItem("cheese", "Cheese", "Sliced pack", "Order", "Add", "cart", "🧀"),
      ]),
      makeSection("dm-used", "Frequently Used", "mini-horizontal", [
        makeItem("morning-milk", "Morning Milk", "Subscription", "Daily", "View", "view", "🌅"),
        makeItem("dairy-combo", "Dairy Combo", "Milk+Curd", "Best Value", "Add", "cart", "📦"),
        makeItem("fresh-curd", "Fresh Curd", "Daily set", "Order", "Add", "cart", "🍶"),
        makeItem("toned-milk", "Toned Milk", "Low fat", "Popular", "Add", "cart", "🥛"),
      ]),
      makeSection("dm-quick", "Quick Orders", "horizontal", [
        makeItem("dmq1", "Milk Refill", "Same day", "Quick", "Order", "whatsapp", "⚡"),
      ]),
    ],
  },
  {
    id: "water-gas",
    name: "Water & Gas",
    icon: "🚰",
    subtitle: "Utility deliveries",
    sections: [
      makeSection("wg-popular", "Popular in Village", "horizontal", [
        makeItem("water-can", "Water Can", "20L", "Popular", "Order", "whatsapp", "💧"),
        makeItem("lpg-refill", "LPG Refill", "Domestic", "Order", "Book", "book", "🔥"),
        makeItem("ro-water", "RO Water", "Filtered", "Order", "Order", "whatsapp", "🚿"),
        makeItem("drinking-jar", "Drinking Jar", "Home use", "Popular", "Order", "whatsapp", "🫙"),
      ]),
      makeSection("wg-new", "New & Trending", "grid", [
        makeItem("gas-booking", "Gas Booking", "Instant", "New", "Book", "book", "⛽"),
        makeItem("emergency-cylinder", "Emergency Cylinder", "Priority", "New", "Book", "call", "🚨", "1800123456"),
        makeItem("water-delivery", "Water Delivery", "Doorstep", "Order", "Order", "whatsapp", "🚚"),
        makeItem("monthly-water", "Monthly Water Plan", "Subscription", "Popular", "View", "view", "📅"),
      ]),
      makeSection("wg-used", "Frequently Used", "mini-horizontal", [
        makeItem("20l-can", "20L Can", "Regular refill", "Daily", "Order", "whatsapp", "🧴"),
        makeItem("water-subscription", "Water Subscription", "Auto refill", "Popular", "View", "view", "🔁"),
        makeItem("gas-check", "Gas Check", "Safety visit", "Book", "Book", "book", "🛡️"),
        makeItem("refill-request", "Refill Request", "Quick request", "Quick", "Call", "call", "📞", "1800123456"),
      ]),
      makeSection("wg-quick", "Quick Orders", "horizontal", [
        makeItem("wgq1", "Instant Cylinder", "Urgent support", "Urgent", "Call", "call", "🚨", "1800123456"),
      ]),
    ],
  },
  {
    id: "medicines",
    name: "Medicines",
    icon: "💊",
    subtitle: "Health essentials",
    sections: [
      makeSection("med-popular", "Popular in Village", "horizontal", [
        makeItem("fever-relief", "Fever Relief", "Paracetamol", "Popular", "Order", "whatsapp", "🌡️"),
        makeItem("cold-tablets", "Cold Tablets", "Cold care", "Order", "Order", "whatsapp", "🤧"),
        makeItem("pain-balm", "Pain Balm", "Fast relief", "Order", "Order", "whatsapp", "🧴"),
        makeItem("first-aid-kit", "First Aid Kit", "Emergency", "Popular", "Add", "cart", "🩹"),
      ]),
      makeSection("med-new", "New & Trending", "grid", [
        makeItem("bp-tablets", "BP Tablets", "Daily dose", "New", "Order", "whatsapp", "🩺"),
        makeItem("diabetes-care", "Diabetes Care", "Sugar control", "New", "Order", "whatsapp", "🧪"),
        makeItem("vitamin-pack", "Vitamin Pack", "Immunity", "Order", "Add", "cart", "💠"),
        makeItem("baby-care", "Baby Care", "Infant safe", "Popular", "Inquiry", "inquiry", "👶"),
      ]),
      makeSection("med-used", "Frequently Used", "mini-horizontal", [
        makeItem("headache", "Headache Relief", "Quick effect", "Daily", "Order", "whatsapp", "🤕"),
        makeItem("digestion", "Digestion Syrup", "Stomach care", "Order", "Order", "whatsapp", "🍯"),
        makeItem("antiseptic", "Antiseptic", "First aid", "Popular", "Add", "cart", "🧴"),
        makeItem("cough-syrup", "Cough Syrup", "Night care", "Order", "Order", "whatsapp", "🍯"),
      ]),
      makeSection("med-quick", "Quick Orders", "horizontal", [
        makeItem("medq1", "Emergency Medicines", "Fast dispatch", "Urgent", "Call", "call", "🚑", "1800123456"),
      ]),
    ],
  },
  {
    id: "food",
    name: "Food",
    icon: "🍲",
    subtitle: "Snacks and meals",
    sections: [
      makeSection("food-popular", "Popular in Village", "horizontal", [
        makeItem("samosa", "Samosa", "Hot and crispy", "Popular", "Add", "cart", "🥟"),
        makeItem("chaat", "Chaat", "Street style", "Order", "Add", "cart", "🥗"),
        makeItem("jalebi", "Jalebi", "Sweet hot", "Order", "Add", "cart", "🧁"),
        makeItem("thali", "Thali", "Full meal", "Popular", "Add", "cart", "🍛"),
      ]),
      makeSection("food-new", "New & Trending", "grid", [
        makeItem("burger", "Burger", "Veg loaded", "New", "Add", "cart", "🍔"),
        makeItem("pizza-slice", "Pizza Slice", "Cheesy", "New", "Add", "cart", "🍕"),
        makeItem("noodles", "Noodles", "Spicy", "Order", "Add", "cart", "🍜"),
        makeItem("momos", "Momos", "Steam hot", "Popular", "Add", "cart", "🥟"),
      ]),
      makeSection("food-used", "Frequently Used", "mini-horizontal", [
        makeItem("tea-stall", "Tea Stall", "Nearby tea", "Daily", "View", "view", "☕"),
        makeItem("breakfast-combo", "Breakfast Combo", "Tea+snack", "Popular", "Add", "cart", "🍱"),
        makeItem("evening-snacks", "Evening Snacks", "Light bites", "Order", "Add", "cart", "🌆"),
        makeItem("sweet-box", "Sweet Box", "Festive", "Popular", "Add", "cart", "🎁"),
      ]),
      makeSection("food-quick", "Quick Orders", "horizontal", [
        makeItem("foodq1", "Fast Delivery Meal", "20 min", "Quick", "Order", "whatsapp", "⚡"),
      ]),
    ],
  },
  {
    id: "services",
    name: "Services",
    icon: "🧰",
    subtitle: "Local professionals",
    sections: [
      makeSection("svc-popular", "Popular in Village", "horizontal", [
        makeItem("electrician", "Electrician", "Wiring", "Popular", "Book", "book", "⚡", "1800123456"),
        makeItem("plumber", "Plumber", "Pipe leak", "Order", "Book", "book", "🔧", "1800123456"),
        makeItem("ac-repair", "AC Repair", "Cooling issues", "Order", "Book", "book", "❄️", "1800123456"),
        makeItem("mobile-repair", "Mobile Repair", "Screen/battery", "Popular", "Book", "book", "📱", "1800123456"),
      ]),
      makeSection("svc-new", "New & Trending", "grid", [
        makeItem("ro-service", "RO Service", "Filter clean", "New", "Book", "book", "🚿", "1800123456"),
        makeItem("carpenter", "Carpenter", "Wood work", "New", "Book", "book", "🪚", "1800123456"),
        makeItem("home-cleaning", "Home Cleaning", "Deep clean", "Order", "Book", "book", "🧹", "1800123456"),
        makeItem("painter", "Painter", "Wall paint", "Popular", "Book", "book", "🎨", "1800123456"),
      ]),
      makeSection("svc-used", "Frequently Used", "mini-horizontal", [
        makeItem("fan-repair", "Fan Repair", "Motor issue", "Daily", "Call", "call", "🌀", "1800123456"),
        makeItem("pipe-fix", "Pipe Fix", "Leak stop", "Order", "Call", "call", "🛠️", "1800123456"),
        makeItem("switch-board", "Switch Board", "Replace/fix", "Popular", "Book", "book", "🔌", "1800123456"),
        makeItem("inverter-check", "Inverter Check", "Backup issue", "Order", "Book", "book", "🔋", "1800123456"),
      ]),
      makeSection("svc-quick", "Quick Orders", "horizontal", [
        makeItem("svcq1", "Emergency Home Visit", "Same hour", "Urgent", "Call", "call", "🚨", "1800123456"),
      ]),
    ],
  },
  {
    id: "shops",
    name: "Shops",
    icon: "🏬",
    subtitle: "Village marketplace",
    sections: [
      makeSection("shop-popular", "Popular in Village", "horizontal", [
        makeItem("kirana-store", "Kirana Store", "Daily goods", "Popular", "View", "view", "🏪"),
        makeItem("dairy-booth", "Dairy Booth", "Milk and paneer", "Order", "View", "view", "🥛"),
        makeItem("medical-store", "Medical Store", "Medicines", "Order", "View", "view", "💊"),
        makeItem("hardware-shop", "Hardware Shop", "Tools", "Popular", "View", "view", "🧰"),
      ]),
      makeSection("shop-new", "New & Trending", "grid", [
        makeItem("gift-shop", "Gift Shop", "Occasion gifts", "New", "Inquiry", "inquiry", "🎁"),
        makeItem("mobile-shop", "Mobile Shop", "Accessories", "New", "Inquiry", "inquiry", "📱"),
        makeItem("clothes-shop", "Clothes Shop", "Family wear", "Order", "Inquiry", "inquiry", "👕"),
        makeItem("footwear-shop", "Footwear Shop", "Daily shoes", "Popular", "Inquiry", "inquiry", "👟"),
      ]),
      makeSection("shop-used", "Frequently Used", "mini-horizontal", [
        makeItem("nearby-store", "Nearby Store", "Open nearby", "Daily", "View", "view", "📍"),
        makeItem("open-now-shop", "Open Now Shop", "Currently open", "Quick", "View", "view", "🕘"),
        makeItem("trusted-seller", "Trusted Seller", "Rated high", "Popular", "View", "view", "⭐"),
        makeItem("best-rated-shop", "Best Rated Shop", "Top reviews", "Popular", "View", "view", "🏆"),
      ]),
      makeSection("shop-quick", "Quick Orders", "horizontal", [
        makeItem("shopq1", "Call Nearby Shop", "Instant inquiry", "Quick", "Call", "call", "📞", "1800123456"),
      ]),
    ],
  },
  {
    id: "rides",
    name: "Rides",
    icon: "🛺",
    subtitle: "Village travel",
    sections: [
      makeSection("ride-popular", "Popular in Village", "horizontal", [
        makeItem("bike-ride", "Bike Ride", "Quick commute", "Popular", "Book", "book", "🏍️"),
        makeItem("auto-ride", "Auto Ride", "Shared/solo", "Order", "Book", "book", "🛺"),
        makeItem("car-booking", "Car Booking", "Comfort ride", "Order", "Book", "book", "🚗"),
        makeItem("emergency-ride", "Emergency Ride", "Priority pickup", "Urgent", "Call", "call", "🚨", "1800123456"),
      ]),
      makeSection("ride-new", "New & Trending", "grid", [
        makeItem("school-drop", "School Drop", "Daily route", "New", "Book", "book", "🚌"),
        makeItem("station-ride", "Station Ride", "Railway route", "Order", "Book", "book", "🚉"),
        makeItem("market-ride", "Market Ride", "Town market", "Popular", "Book", "book", "🛍️"),
        makeItem("long-distance", "Long Distance Ride", "Nearby city", "New", "Inquiry", "inquiry", "🛣️"),
      ]),
      makeSection("ride-used", "Frequently Used", "mini-horizontal", [
        makeItem("quick-pickup", "Quick Pickup", "Nearest driver", "Quick", "Call", "call", "📍", "1800123456"),
        makeItem("village-ride", "Village Ride", "Internal route", "Daily", "Book", "book", "🏘️"),
        makeItem("family-ride", "Family Ride", "Spacious", "Popular", "Book", "book", "👨‍👩‍👧"),
        makeItem("late-night", "Late Night Ride", "Safe travel", "Order", "Book", "book", "🌙"),
      ]),
      makeSection("ride-quick", "Quick Orders", "horizontal", [
        makeItem("rideq1", "Call Driver Now", "Immediate", "Urgent", "Call", "call", "📞", "1800123456"),
      ]),
    ],
  },
  {
    id: "teachers",
    name: "Teachers",
    icon: "👩‍🏫",
    subtitle: "Trusted tutors",
    sections: [
      makeSection("teach-popular", "Popular in Village", "horizontal", [
        makeItem("maths", "Maths Teacher", "Class 8-12", "Popular", "Inquiry", "inquiry", "➗"),
        makeItem("english", "English Teacher", "Grammar/speaking", "Order", "Inquiry", "inquiry", "🗣️"),
        makeItem("science", "Science Teacher", "Physics/Chemistry", "Order", "Inquiry", "inquiry", "🔬"),
        makeItem("hindi", "Hindi Teacher", "Language support", "Popular", "Inquiry", "inquiry", "📚"),
      ]),
      makeSection("teach-new", "New & Trending", "grid", [
        makeItem("computer-tutor", "Computer Tutor", "Basics and typing", "New", "Inquiry", "inquiry", "💻"),
        makeItem("spoken-eng", "Spoken English", "Fluency", "New", "Inquiry", "inquiry", "🎤"),
        makeItem("home-tuition", "Home Tuition", "At home", "Order", "Inquiry", "inquiry", "🏠"),
        makeItem("exam-prep", "Exam Prep", "Board exams", "Popular", "Inquiry", "inquiry", "📝"),
      ]),
      makeSection("teach-used", "Frequently Used", "mini-horizontal", [
        makeItem("class10", "Class 10 Tutor", "Board focus", "Popular", "View", "view", "🔟"),
        makeItem("class12", "Class 12 Tutor", "Senior prep", "Order", "View", "view", "1️⃣2️⃣"),
        makeItem("primary", "Primary Teacher", "Class 1-5", "Daily", "View", "view", "🧒"),
        makeItem("mentor", "Test Mentor", "Weekly tests", "Order", "View", "view", "✅"),
      ]),
      makeSection("teach-quick", "Quick Orders", "horizontal", [
        makeItem("teachq1", "Call Tutor Desk", "Match with teacher", "Quick", "Call", "call", "📞", "1800123456"),
      ]),
    ],
  },
  {
    id: "coaching",
    name: "Coaching",
    icon: "📘",
    subtitle: "Exam and skill prep",
    sections: [
      makeSection("coach-popular", "Popular in Village", "horizontal", [
        makeItem("ssc", "SSC Coaching", "Govt prep", "Popular", "Inquiry", "inquiry", "🏛️"),
        makeItem("neet", "NEET Help", "Medical prep", "Order", "Inquiry", "inquiry", "🩺"),
        makeItem("jee", "JEE Basics", "Engineering prep", "Order", "Inquiry", "inquiry", "🧮"),
        makeItem("board-prep", "Board Prep", "Class 10/12", "Popular", "Inquiry", "inquiry", "📚"),
      ]),
      makeSection("coach-new", "New & Trending", "grid", [
        makeItem("spoken-english-c", "Spoken English", "Soft skills", "New", "Inquiry", "inquiry", "🎤"),
        makeItem("computer-class", "Computer Class", "Digital basics", "New", "Inquiry", "inquiry", "💻"),
        makeItem("typing", "Typing Course", "Speed practice", "Order", "Inquiry", "inquiry", "⌨️"),
        makeItem("skill-center", "Skill Center", "Job oriented", "Popular", "Inquiry", "inquiry", "🛠️"),
      ]),
      makeSection("coach-used", "Frequently Used", "mini-horizontal", [
        makeItem("evening-batch", "Evening Batch", "After school", "Daily", "View", "view", "🌆"),
        makeItem("weekend-batch", "Weekend Batch", "Sat-Sun", "Order", "View", "view", "📅"),
        makeItem("demo-class", "Demo Class", "Try before join", "Popular", "View", "view", "🎓"),
        makeItem("crash-course", "Crash Course", "Fast revision", "Order", "View", "view", "⚡"),
      ]),
      makeSection("coach-quick", "Quick Orders", "horizontal", [
        makeItem("coachq1", "Call Coaching Desk", "Guidance now", "Quick", "Call", "call", "📞", "1800123456"),
      ]),
    ],
  },
  {
    id: "jobs",
    name: "Jobs",
    icon: "💼",
    subtitle: "Local opportunities",
    sections: [
      makeSection("jobs-popular", "Popular in Village", "horizontal", [
        makeItem("shop-helper", "Shop Helper", "Retail assist", "Popular", "Inquiry", "inquiry", "🏪"),
        makeItem("delivery-boy", "Delivery Boy", "Daily route", "Order", "Inquiry", "inquiry", "🛵"),
        makeItem("tuition-teacher", "Tuition Teacher", "Evening batches", "Order", "Inquiry", "inquiry", "📘"),
        makeItem("farm-helper", "Farm Helper", "Field work", "Popular", "Inquiry", "inquiry", "🌾"),
      ]),
      makeSection("jobs-new", "New & Trending", "grid", [
        makeItem("data-entry", "Data Entry", "Basic computer", "New", "Inquiry", "inquiry", "⌨️"),
        makeItem("reception", "Reception Help", "Front desk", "New", "Inquiry", "inquiry", "🧾"),
        makeItem("field-sales", "Field Sales", "Market connect", "Order", "Inquiry", "inquiry", "🤝"),
        makeItem("driver-job", "Driver Job", "Vehicle route", "Popular", "Inquiry", "inquiry", "🚗"),
      ]),
      makeSection("jobs-used", "Frequently Used", "mini-horizontal", [
        makeItem("nearby-jobs", "Nearby Jobs", "Within 5km", "Daily", "View", "view", "📍"),
        makeItem("part-time", "Part Time", "Flexible hours", "Order", "View", "view", "⏱️"),
        makeItem("full-time", "Full Time", "Stable role", "Popular", "View", "view", "🧑‍💼"),
        makeItem("urgent-hiring", "Urgent Hiring", "Immediate join", "Urgent", "Call", "call", "📞", "1800123456"),
      ]),
      makeSection("jobs-quick", "Quick Orders", "horizontal", [
        makeItem("jobsq1", "Talk to Job Desk", "Career help", "Quick", "Call", "call", "📞", "1800123456"),
      ]),
    ],
  },
  {
    id: "rewards",
    name: "Rewards",
    icon: "🎉",
    subtitle: "Earn and redeem",
    sections: [
      makeSection("rewards-popular", "Popular in Village", "horizontal", [
        makeItem("refer-earn", "Refer & Earn", "Invite friends", "Popular", "View", "view", "🤝"),
        makeItem("lucky-draw", "Lucky Draw", "Weekly draw", "Order", "View", "view", "🎟️"),
        makeItem("daily-reward", "Daily Reward", "Check in", "Order", "View", "view", "🎁"),
        makeItem("cashback", "Cashback", "On every order", "Popular", "View", "view", "💸"),
      ]),
      makeSection("rewards-new", "New & Trending", "grid", [
        makeItem("spin-win", "Spin & Win", "Daily spin", "New", "View", "view", "🎡"),
        makeItem("first-order", "First Order Gift", "New users", "New", "View", "view", "🎀"),
        makeItem("partner-coupon", "Partner Coupon", "Shop offers", "Order", "View", "view", "🏷️"),
        makeItem("festival-offer", "Festival Offer", "Season specials", "Popular", "View", "view", "🎊"),
      ]),
      makeSection("rewards-used", "Frequently Used", "mini-horizontal", [
        makeItem("my-points", "My Points", "Points wallet", "Daily", "View", "view", "🏅"),
        makeItem("redeem-gift", "Redeem Gift", "Use points", "Order", "View", "view", "🎁"),
        makeItem("reward-history", "Reward History", "Past rewards", "Popular", "View", "view", "📜"),
        makeItem("invite-friends", "Invite Friends", "Share code", "Order", "Inquiry", "whatsapp", "📲"),
      ]),
      makeSection("rewards-quick", "Quick Orders", "horizontal", [
        makeItem("rewq1", "Redeem Now", "Top rewards", "Quick", "View", "view", "⚡"),
      ]),
    ],
  },
  {
    id: "credit-paylater",
    name: "Credit / Pay Later",
    icon: "💳",
    subtitle: "Flexible village credit",
    sections: [
      makeSection("credit-popular", "Popular in Village", "horizontal", [
        makeItem("grocery-credit", "Grocery Credit", "Monthly cycle", "Popular", "Inquiry", "inquiry", "🛒"),
        makeItem("milk-pay", "Milk Monthly Pay", "End month bill", "Order", "Inquiry", "inquiry", "🥛"),
        makeItem("gas-pay-later", "Gas Pay Later", "Deferred payment", "Order", "Inquiry", "inquiry", "🔥"),
        makeItem("shop-ledger", "Shop Ledger", "Track dues", "Popular", "View", "view", "📒"),
      ]),
      makeSection("credit-new", "New & Trending", "grid", [
        makeItem("partner-credit", "Partner Credit", "For loyal users", "New", "Inquiry", "inquiry", "🤝"),
        makeItem("weekly-bill", "Weekly Bill", "Short cycle", "New", "View", "view", "🗓️"),
        makeItem("monthly-settlement", "Monthly Settlement", "Auto summary", "Order", "View", "view", "🧾"),
        makeItem("emergency-credit", "Emergency Credit", "Urgent support", "Popular", "Call", "call", "🚨", "1800123456"),
      ]),
      makeSection("credit-used", "Frequently Used", "mini-horizontal", [
        makeItem("due-balance", "Due Balance", "Current dues", "Daily", "View", "view", "💰"),
        makeItem("bill-summary", "Bill Summary", "All entries", "Order", "View", "view", "📊"),
        makeItem("payment-reminder", "Payment Reminder", "Due alerts", "Popular", "View", "view", "⏰"),
        makeItem("credit-request", "Credit Request", "Raise request", "Order", "Inquiry", "inquiry", "📩"),
      ]),
      makeSection("credit-quick", "Quick Orders", "horizontal", [
        makeItem("creditq1", "Talk to Credit Desk", "Support now", "Quick", "Call", "call", "📞", "1800123456"),
      ]),
    ],
  },
];

