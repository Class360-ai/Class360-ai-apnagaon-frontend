const makeItem = (id, name, subtitle, badge, actionLabel, actionType, icon = "🏡", phone = "") => ({
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

export const villageData = [
  {
    id: "essential-daily-needs",
    name: "Essential Daily Needs",
    icon: "🏡",
    subtitle: "Daily village essentials",
    sections: [
      makeSection("edn-popular", "Popular in Village", "horizontal", [
        makeItem("ration-packs", "Ration Packs", "Monthly supply", "Popular", "Order", "whatsapp", "🧺"),
        makeItem("milk-route", "Milk Route", "Morning delivery", "Daily", "Order", "whatsapp", "🥛"),
        makeItem("water-cans", "Water Cans", "20L can", "Order", "Order", "whatsapp", "🚰"),
      ]),
      makeSection("edn-new", "New & Trending", "grid", [
        makeItem("home-basket", "Home Basket", "Mixed essentials", "New", "Add", "cart", "🛍️"),
        makeItem("farmer-market", "Farmer Market", "Fresh produce", "Popular", "View", "view", "🌾"),
        makeItem("quick-cart", "Quick Cart", "Instant refill", "Order", "Add", "cart", "⚡"),
        makeItem("family-pack", "Family Pack", "Budget combo", "New", "Add", "cart", "👨‍👩‍👧"),
      ]),
      makeSection("edn-used", "Most Used", "mini-horizontal", [
        makeItem("daily-combo", "Daily Combo", "Top picks", "Popular", "Order", "whatsapp", "📦"),
        makeItem("repeat-order", "Repeat Order", "Last basket", "Quick", "View", "view", "🔁"),
      ]),
      makeSection("edn-help", "Quick Help", "horizontal", [
        makeItem("daily-help", "Daily Help Desk", "Need assistance", "Quick", "Call", "call", "📞", "1800123456"),
      ]),
    ],
  },
  {
    id: "smart-village-services",
    name: "Smart Village Services",
    icon: "🛰️",
    subtitle: "Verified local experts",
    sections: [
      makeSection("svs-popular", "Popular in Village", "horizontal", [
        makeItem("electrician", "Electrician", "Wiring and meter", "Popular", "Book", "book", "⚡", "1800123456"),
        makeItem("plumber", "Plumber", "Pipe and leakage", "Order", "Book", "book", "🔧", "1800123456"),
        makeItem("mobile-repair", "Mobile Repair", "Screen and battery", "Order", "Book", "book", "📱", "1800123456"),
        makeItem("ro-service", "RO Service", "Water purifier", "Popular", "Book", "book", "🚿", "1800123456"),
      ]),
      makeSection("svs-new", "New & Trending", "grid", [
        makeItem("ac-service", "AC Service", "Cooling repair", "New", "Book", "book", "❄️", "1800123456"),
        makeItem("home-cleaning", "Home Cleaning", "Deep clean", "New", "Book", "book", "🧹", "1800123456"),
        makeItem("inverter-repair", "Inverter Repair", "Power backup", "Order", "Book", "book", "🔋", "1800123456"),
        makeItem("solar-help", "Solar Help", "Panel support", "Popular", "Book", "book", "☀️", "1800123456"),
      ]),
      makeSection("svs-used", "Most Used", "mini-horizontal", [
        makeItem("fan-repair", "Fan Repair", "Quick fix", "Popular", "Call", "call", "🌀", "1800123456"),
        makeItem("switch-fix", "Switch Fix", "Board work", "Order", "Book", "book", "🔌", "1800123456"),
      ]),
      makeSection("svs-help", "Quick Help", "horizontal", [
        makeItem("svs-emergency", "Emergency Service", "Same hour", "Urgent", "Call", "call", "🚨", "1800123456"),
      ]),
    ],
  },
  {
    id: "education-coaching",
    name: "Education & Coaching",
    icon: "📚",
    subtitle: "Learning and guidance",
    sections: [
      makeSection("edu-popular", "Popular in Village", "horizontal", [
        makeItem("school-help", "School Help", "Homework support", "Popular", "Inquiry", "inquiry", "🏫"),
        makeItem("home-tuition", "Home Tuition", "At-home class", "Order", "Inquiry", "inquiry", "🏠"),
        makeItem("coaching-center", "Coaching Center", "Exam prep", "Order", "Inquiry", "inquiry", "🎯"),
        makeItem("spoken-english", "Spoken English", "Communication", "Popular", "Inquiry", "inquiry", "🎤"),
      ]),
      makeSection("edu-new", "New & Trending", "grid", [
        makeItem("computer-class", "Computer Class", "Digital basics", "New", "Inquiry", "inquiry", "💻"),
        makeItem("scholarship-help", "Scholarship Help", "Form support", "New", "Inquiry", "inquiry", "🎓"),
        makeItem("exam-form-help", "Exam Form Help", "Application assist", "Order", "Inquiry", "inquiry", "📝"),
        makeItem("digital-library", "Digital Library", "Online resources", "Popular", "View", "view", "📖"),
      ]),
      makeSection("edu-used", "Most Used", "mini-horizontal", [
        makeItem("class10-support", "Class 10 Support", "Board focus", "Popular", "View", "view", "🔟"),
        makeItem("class12-support", "Class 12 Support", "Board focus", "Order", "View", "view", "1️⃣2️⃣"),
      ]),
      makeSection("edu-help", "Quick Help", "horizontal", [
        makeItem("edu-desk", "Education Desk", "Find tutor", "Quick", "Call", "call", "📞", "1800123456"),
      ]),
    ],
  },
  {
    id: "emergency-help",
    name: "Emergency Help",
    icon: "🚑",
    subtitle: "Urgent village support",
    sections: [
      makeSection("emg-popular", "Popular in Village", "horizontal", [
        makeItem("ambulance", "Ambulance Contact", "Nearest ambulance", "Urgent", "Call", "call", "🚑", "102"),
        makeItem("emergency-ride", "Emergency Ride", "Immediate pickup", "Quick", "Call", "call", "🛺", "1800123456"),
        makeItem("medicine-help", "Medicine Help", "Urgent medicine", "Order", "Order", "whatsapp", "💊"),
        makeItem("doctor-call", "Doctor Call", "Quick consult", "Popular", "Call", "call", "👨‍⚕️", "1800123456"),
      ]),
      makeSection("emg-new", "New & Trending", "grid", [
        makeItem("blood-help", "Blood Help", "Donor support", "New", "Call", "call", "🩸", "1800123456"),
        makeItem("night-support", "Night Support", "Late-hour support", "New", "Call", "call", "🌙", "1800123456"),
        makeItem("police-help", "Police Help", "Emergency security", "Order", "Call", "call", "🚓", "100"),
        makeItem("fire-help", "Fire Help", "Fire emergency", "Popular", "Call", "call", "🚒", "101"),
      ]),
      makeSection("emg-used", "Most Used", "mini-horizontal", [
        makeItem("saved-contacts", "Saved Contacts", "Emergency list", "Popular", "View", "view", "📌"),
      ]),
      makeSection("emg-help", "Quick Help", "horizontal", [
        makeItem("help-center", "Emergency Help Center", "Always active", "Quick", "Call", "call", "☎️", "112"),
      ]),
    ],
  },
  {
    id: "jobs-opportunities",
    name: "Jobs & Opportunities",
    icon: "💼",
    subtitle: "Village careers",
    sections: [
      makeSection("job-popular", "Popular in Village", "horizontal", [
        makeItem("shop-jobs", "Shop Jobs", "Retail roles", "Popular", "Inquiry", "inquiry", "🏪"),
        makeItem("delivery-jobs", "Delivery Jobs", "Route jobs", "Order", "Inquiry", "inquiry", "🛵"),
        makeItem("tuition-jobs", "Tuition Jobs", "Teaching roles", "Order", "Inquiry", "inquiry", "📘"),
        makeItem("helper-jobs", "Helper Jobs", "General support", "Popular", "Inquiry", "inquiry", "🧑‍🔧"),
      ]),
      makeSection("job-new", "New & Trending", "grid", [
        makeItem("data-entry", "Data Entry", "Computer work", "New", "Inquiry", "inquiry", "⌨️"),
        makeItem("local-work", "Local Work", "Nearby jobs", "New", "Inquiry", "inquiry", "📍"),
        makeItem("seasonal-jobs", "Seasonal Jobs", "Temporary roles", "Order", "Inquiry", "inquiry", "🌾"),
        makeItem("skill-work", "Skill Work", "Trade work", "Popular", "Inquiry", "inquiry", "🛠️"),
      ]),
      makeSection("job-used", "Most Used", "mini-horizontal", [
        makeItem("part-time", "Part Time", "Flexible", "Popular", "View", "view", "⏱️"),
        makeItem("urgent-hiring", "Urgent Hiring", "Immediate join", "Urgent", "Call", "call", "📞", "1800123456"),
      ]),
      makeSection("job-help", "Quick Help", "horizontal", [
        makeItem("job-desk", "Job Help Desk", "Career support", "Quick", "Call", "call", "☎️", "1800123456"),
      ]),
    ],
  },
  {
    id: "partner-shops",
    name: "Partner Shops",
    icon: "🤝",
    subtitle: "Trusted partner stores",
    sections: [
      makeSection("ps-popular", "Popular in Village", "horizontal", [
        makeItem("kirana-partner", "Kirana Partner", "Daily essentials", "Popular", "View", "view", "🏪"),
        makeItem("dairy-partner", "Dairy Partner", "Milk products", "Order", "View", "view", "🥛"),
        makeItem("medical-partner", "Medical Partner", "Medicine support", "Order", "View", "view", "💊"),
        makeItem("hardware-partner", "Hardware Partner", "Tools store", "Popular", "View", "view", "🧰"),
      ]),
      makeSection("ps-new", "New & Trending", "grid", [
        makeItem("mobile-shop", "Mobile Shop", "Accessories", "New", "Inquiry", "inquiry", "📱"),
        makeItem("sweet-shop", "Sweet Shop", "Fresh sweets", "New", "Inquiry", "inquiry", "🍬"),
        makeItem("bakery-partner", "Bakery Partner", "Breads/snacks", "Order", "Inquiry", "inquiry", "🥯"),
        makeItem("vegetable-seller", "Vegetable Seller", "Fresh veggies", "Popular", "Inquiry", "inquiry", "🥬"),
      ]),
      makeSection("ps-used", "Most Used", "mini-horizontal", [
        makeItem("best-seller", "Best Seller", "Top rated", "Popular", "View", "view", "⭐"),
      ]),
      makeSection("ps-help", "Quick Help", "horizontal", [
        makeItem("partner-desk", "Partner Shop Desk", "Connect now", "Quick", "Call", "call", "📞", "1800123456"),
      ]),
    ],
  },
  {
    id: "health-support",
    name: "Health Support",
    icon: "🩺",
    subtitle: "Village wellness services",
    sections: [
      makeSection("hs-popular", "Popular in Village", "horizontal", [
        makeItem("medicine-delivery", "Medicine Delivery", "Doorstep meds", "Popular", "Order", "whatsapp", "💊"),
        makeItem("bp-check", "BP Check", "Home test", "Order", "Book", "book", "🩺", "1800123456"),
        makeItem("sugar-test", "Sugar Test", "Home sample", "Order", "Book", "book", "🧪", "1800123456"),
        makeItem("doctor-visit", "Doctor Visit", "Visit booking", "Popular", "Book", "book", "👨‍⚕️", "1800123456"),
      ]),
      makeSection("hs-new", "New & Trending", "grid", [
        makeItem("baby-care", "Baby Care", "Child support", "New", "Inquiry", "inquiry", "👶"),
        makeItem("health-camp", "Health Camp", "Village camp", "New", "View", "view", "🏥"),
        makeItem("senior-care", "Senior Care", "Elder support", "Order", "Inquiry", "inquiry", "👴"),
        makeItem("wellness-pack", "Wellness Pack", "Preventive care", "Popular", "View", "view", "🌿"),
      ]),
      makeSection("hs-used", "Most Used", "mini-horizontal", [
        makeItem("monthly-check", "Monthly Check", "Regular checks", "Popular", "Book", "book", "📅"),
      ]),
      makeSection("hs-help", "Quick Help", "horizontal", [
        makeItem("health-desk", "Health Help Desk", "Speak now", "Quick", "Call", "call", "☎️", "1800123456"),
      ]),
    ],
  },
  {
    id: "home-services",
    name: "Home Services",
    icon: "🏠",
    subtitle: "Home care and repairs",
    sections: [
      makeSection("hom-popular", "Popular in Village", "horizontal", [
        makeItem("fan-repair", "Fan Repair", "Motor issue", "Popular", "Book", "book", "🌀", "1800123456"),
        makeItem("pipe-fix", "Pipe Fix", "Leakage", "Order", "Book", "book", "🔧", "1800123456"),
        makeItem("switch-work", "Switch Work", "Electrical board", "Order", "Book", "book", "🔌", "1800123456"),
        makeItem("house-cleaning", "House Cleaning", "Deep clean", "Popular", "Book", "book", "🧹", "1800123456"),
      ]),
      makeSection("hom-new", "New & Trending", "grid", [
        makeItem("painting", "Painting", "Wall refresh", "New", "Book", "book", "🎨", "1800123456"),
        makeItem("furniture-fix", "Furniture Fix", "Woodwork", "New", "Book", "book", "🪚", "1800123456"),
        makeItem("cctv-setup", "CCTV Setup", "Home security", "Order", "Book", "book", "📷", "1800123456"),
        makeItem("appliance-repair", "Appliance Repair", "TV/fridge repair", "Popular", "Book", "book", "🛠️", "1800123456"),
      ]),
      makeSection("hom-used", "Most Used", "mini-horizontal", [
        makeItem("home-emergency", "Home Emergency", "Urgent visit", "Urgent", "Call", "call", "🚨", "1800123456"),
      ]),
      makeSection("hom-help", "Quick Help", "horizontal", [
        makeItem("home-desk", "Home Service Desk", "Need support", "Quick", "Call", "call", "📞", "1800123456"),
      ]),
    ],
  },
  {
    id: "village-transport",
    name: "Village Transport",
    icon: "🚌",
    subtitle: "Local mobility support",
    sections: [
      makeSection("vt-popular", "Popular in Village", "horizontal", [
        makeItem("auto-booking", "Auto Booking", "Local route", "Popular", "Book", "book", "🛺", "1800123456"),
        makeItem("bike-ride", "Bike Ride", "Quick travel", "Order", "Book", "book", "🏍️", "1800123456"),
        makeItem("school-ride", "School Ride", "Daily school route", "Order", "Book", "book", "🚌", "1800123456"),
        makeItem("station-ride", "Station Ride", "Railway route", "Popular", "Book", "book", "🚉", "1800123456"),
      ]),
      makeSection("vt-new", "New & Trending", "grid", [
        makeItem("tractor-help", "Tractor Help", "Farm transport", "New", "Inquiry", "inquiry", "🚜"),
        makeItem("goods-transport", "Goods Transport", "Load transfer", "New", "Book", "book", "🚚", "1800123456"),
        makeItem("emergency-pickup", "Emergency Pickup", "Urgent transport", "Order", "Call", "call", "🚨", "1800123456"),
        makeItem("family-ride", "Family Ride", "Group travel", "Popular", "Book", "book", "👨‍👩‍👧", "1800123456"),
      ]),
      makeSection("vt-used", "Most Used", "mini-horizontal", [
        makeItem("quick-pickup", "Quick Pickup", "Nearest driver", "Quick", "Call", "call", "📍", "1800123456"),
      ]),
      makeSection("vt-help", "Quick Help", "horizontal", [
        makeItem("transport-desk", "Transport Help Desk", "Book now", "Quick", "Call", "call", "☎️", "1800123456"),
      ]),
    ],
  },
  {
    id: "local-help",
    name: "Local Help",
    icon: "📍",
    subtitle: "Documentation and digital help",
    sections: [
      makeSection("lh-popular", "Popular in Village", "horizontal", [
        makeItem("document-print", "Document Print", "Instant print", "Popular", "Inquiry", "inquiry", "🖨️"),
        makeItem("form-fill", "Online Form Fill", "Application support", "Order", "Inquiry", "inquiry", "📄"),
        makeItem("aadhaar-help", "Aadhaar Help", "Update support", "Order", "Inquiry", "inquiry", "🆔"),
        makeItem("pan-help", "PAN Help", "PAN support", "Popular", "Inquiry", "inquiry", "🪪"),
      ]),
      makeSection("lh-new", "New & Trending", "grid", [
        makeItem("recharge-help", "Recharge Help", "Mobile recharge", "New", "View", "view", "📲"),
        makeItem("bill-payment", "Bill Payment", "Electricity/water", "New", "View", "view", "💡"),
        makeItem("govt-form", "Government Form", "Online forms", "Order", "Inquiry", "inquiry", "🏛️"),
        makeItem("banking-support", "Banking Support", "Account support", "Popular", "Inquiry", "inquiry", "🏦"),
      ]),
      makeSection("lh-used", "Most Used", "mini-horizontal", [
        makeItem("service-center", "Service Center", "Nearby center", "Popular", "View", "view", "📍"),
      ]),
      makeSection("lh-help", "Quick Help", "horizontal", [
        makeItem("local-desk", "Local Help Desk", "Talk now", "Quick", "Call", "call", "📞", "1800123456"),
      ]),
    ],
  },
];

