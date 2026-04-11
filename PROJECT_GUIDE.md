# ApnaGaon - Premium Village Commerce Platform

A modern, mobile-first local commerce and services platform built for villages and small towns in India. ApnaGaon combines quick commerce (like Blinkit), local services marketplace (like UrbanCompany), and job listings - all bilingual in Hindi and English.

## 🚀 Features

### ✅ Core Features Implemented
- **Multi-page SPA** with React Router
- **Bilingual UI** - Hindi/English toggle
- **Product & Service Marketplace** - Browse & order daily needs and services
- **Smart Cart** - Persistent cart with localStorage
- **WhatsApp Integration** - Prefilled order messages
- **Category System** - 8+ Daily Needs + 6+ Smart Village Services
- **Realistic Demo Data** - 20+ products, 8+ services with ratings and details
- **Responsive Design** - Mobile-first UI with bottom navigation

### 📱 Mobile-First Design
- Bottom navigation for easy thumb access
- Full-screen cards and images
- Touch-friendly buttons and interactions
- Optimized for low-bandwidth areas

### 🌍 Bilingual Support
- Hindi/English toggle in settings
- All labels, buttons, descriptions translated
- Smart language preference persistence

### 📲 WhatsApp Integration
- Order summary with product details
- Service inquiry messages
- Direct provider contact links
- Prefilled templates for each action type

## 📂 Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── Header.jsx          # Top header with location & search
│   ├── BottomNav.jsx       # Bottom navigation
│   ├── ProductCard.jsx     # Product card component
│   ├── ServiceCard.jsx     # Service card component
│   ├── CategoryGrid.jsx    # Category grid display
│   ├── Skeleton.jsx        # Loading skeleton
│   └── EmptyState.jsx      # Empty state UI
│
├── pages/                  # Page components
│   ├── HomePage.jsx        # Home with hero, categories, products
│   ├── CategoryPage.jsx    # Category products/services listing
│   ├── CartPage.jsx        # Shopping cart & checkout
│   ├── ProfilePage.jsx     # User profile & settings
│   ├── OrdersPage.jsx      # Order history
│   └── NotFoundPage.jsx    # 404 page
│
├── context/                # React Context for state management
│   ├── CartContext.jsx     # Cart state & functions
│   ├── LanguageContext.jsx # Language toggle
│   └── UserContext.jsx     # User data & preferences
│
├── data/                   # Data & configuration
│   ├── translations.js     # Hindi/English translations
│   ├── categories.js       # Category configuration
│   └── seed-data.js        # Demo products & services
│
├── utils/                  # Utility functions
│   ├── api.js             # Backend API calls
│   ├── storage.js         # localStorage helpers
│   ├── whatsappUtils.js   # WhatsApp message generation
│   ├── helpers.js         # Formatting & utility functions
│   └── useTranslation.js  # Custom translation hook
│
├── App.jsx                # Main router component
├── main.jsx               # Entry point
├── index.css              # Global styles
└── App.css                # Component styles (deprecated)
```

## 🛠 Tech Stack

- **Frontend**: React 19, Vite 8
- **Styling**: Tailwind CSS 3.4
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Package Manager**: npm
- **Build Tool**: Vite

## 📦 Installation & Running

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Setup
```bash
# Clone repository
cd c:\Users\erabh\aapnagaon-ui

# Install dependencies
npm install

# Install React Router (already done)
npm install react-router-dom

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Server
```
Available at: http://localhost:5176 (or next available port)
```

## 🎯 Key Components

### Home Page
- Premium hero banner with offers
- Quick navigation chips (quick access to popular categories)
- Featured daily needs & smart village categories
- Popular products showcase
- WhatsApp support CTA button

### Category Pages
- Filtered products/services by category
- Product cards with:
  - Image, name, price, discount, rating
  - Add to cart / Quantity controls
  - Category and unit info
- Service cards with:
  - Provider info, rating, availability
  - Fee information
  - WhatsApp & Call buttons

### Cart Page
- Visual item cards with images
- Quantity increment/decrement
- Subtotal, delivery fee (free), total
- One-click WhatsApp checkout
- Empty state messaging

### Profile Page
- User information edit
- Language preference toggle (Hindi/English)
- Order history link
- Sign out functionality
- Data persistence via localStorage

## 🌐 Bilingual System

### How Translation Works
1. **Translation Hook**: Use `useTranslation()` in components
2. **Translation Object**: All strings in `src/data/translations.js`
3. **Language Context**: `useLanguage()` for toggle & current language
4. **Persistence**: Language preference saved in localStorage

### Example Usage
```jsx
import useTranslation from "../utils/useTranslation";

function MyComponent() {
  const { t, lang } = useTranslation();
  
  return (
    <div>
      <h1>{t("home")}</h1>  // "Home" or "होम"
      <p>{lang === "hi" ? "हिंदी" : "English"}</p>
    </div>
  );
}
```

## 📱 WhatsApp Integration

### Safe Message Generation
```javascript
import { safeGenerateMessage, getWhatsAppLink } from "../utils/whatsappUtils";

// Generate order message
const message = safeGenerateMessage("cart-order", {
  items: cartItems,
  totalPrice: 500,
  village: "Azamgarh",
  lang: "en"
});

// Get WhatsApp link (safe, handles missing fields)
const link = getWhatsAppLink(message);
window.open(link, "_blank");
```

### Message Types
- `product-order`: Single product order
- `service-inquiry`: Service inquiry
- `cart-order`: Full cart checkout

## 💾 Data Persistence

### Cart
- Auto-saved to localStorage
- Persists across sessions
- Functions: `saveCartToLocalStorage()`, `getCartFromLocalStorage()`

### Language
- Preference saved in localStorage
- Defaults to English if not set
- Functions: `saveLanguagePreference()`, `getLanguagePreference()`

### User
- Name, phone, village, address
- Saved in localStorage
- Functions: `saveUserPreference()`, `getUserPreference()`

## 🗂 Real Demo Data

### Products (20 items)
- Fresh Produce (Tomato, Potato, Onion, Carrot, Etc.)
- Dairy & Milk (Milk, Eggs, Curd, Butter)
- Medicines (Aspirin, Cough Syrup)
- Food & Snacks (Bread, Samosas, Biscuits)

### Services (8 items)
- **Teachers & Coaching**: English, Math (with experience, fees)
- **Jobs**: Shop Manager, Delivery Partner
- **Services**: Electrician, Plumber, Carpenter
- **Ride**: Auto Rickshaw sharing

Each with:
- Full contact details
- Availability info
- Ratings & reviews
- Service area coverage
- Fee structure

## 🔗 API Service Layer

### Available for Backend Integration
```javascript
import { productsAPI, servicesAPI, ordersAPI } from "./utils/api";

// Products
await productsAPI.getAll();
await productsAPI.getByCategory("dairy-milk");

// Services  
await servicesAPI.getByCategory("teachers");

// Orders
await ordersAPI.create({ items, total, userPhone });

// Inquiries
await inquiriesAPI.create({ serviceName, userPhone });
```

### Environment Variables
Create `.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Future Phases

### Phase 3: Backend (Node.js + Express + MongoDB)
- [ ] Product model & routes (CRUD)
- [ ] Service model & routes (CRUD)
- [ ] Order model & routes
- [ ] Inquiry model & routes
- [ ] Seed data scripts
- [ ] API documentation

### Phase 4: Advanced Features
- [ ] Search functionality
- [ ] Wishlist/Favorites
- [ ] User authentication
- [ ] Payment integration
- [ ] Order tracking
- [ ] Rating & reviews system
- [ ] Admin dashboard
- [ ] Analytics

### Phase 5: Optimization
- [ ] Image optimization & CDN
- [ ] Caching strategies
- [ ] PWA for offline access
- [ ] SEO optimization
- [ ] Performance monitoring

## 📞 Support & Help

### WhatsApp Support
- Embedded floating button on home page
- Direct inquiry link for users
- Prefilled templates with context

### Contact
- Default business number: +919876543200 (can be changed in `whatsappUtils.js`)
- All service providers have direct WhatsApp numbers

## 🔒 Safety & Best Practices

### Input Validation
- All user inputs sanitized
- Phone numbers validated
- Safe WhatsApp URL encoding

### Error Handling
- Try-catch in all async operations
- Fallback UI states
- localStorage error handling
- Missing image feedback

### Performance
- Lazy loading components
- Optimized re-renders with memo
- Efficient state management
- Local storage caching

## 🎨 UI/UX Details

### Color System
- **Primary**: Yellow (#FBBF24) - Main actions, highlights
- **Secondary**: Gray scale - Neutral elements
- **Status**: Green (success), Red (discounts), Blue (services)
- **Alert**: Red - For important actions

### Typography
- **Bold**: Titles, price, important info
- **Semibold**: Labels, section titles
- **Regular**: Body text, descriptions
- **Small**: Secondary info, hints

### Spacing
- Consistent padding: 4 (1rem) baseunit
- Gap between items: 3 (0.75rem)
- Vertical rhythm maintained

## 📊 Performance Metrics

Current Build Size:
- HTML: 0.46 KB (gzip)
- CSS: 18.02 KB (gzip: 4.03 KB)
- JS: 287.92 KB (gzip: 89.30 KB)
- Total: ~93 KB gzipped

Build Time: ~3.5 seconds

## 🤝 Contributing

This is a production-ready template. To extend:

1. Add new categories in `src/data/categories.js`
2. Add new seed data in `src/data/seed-data.js`
3. Create new pages in `src/pages/`
4. Add new translations in `src/data/translations.js`
5. Create new components in `src/components/`

## 📝 Notes

- All demo data is realistic for Azamgarh, UP
- WhatsApp links use default business number (update in `utils/whatsappUtils.js`)
- No backend required for frontend functionality (uses seed data)
- Ready for backend integration via API service layer

## ✨ Credits

Built with:
- React 19  
- Tailwind CSS
- Lucide Icons
- Vite

Designed for ApnaGaon - A premium village commerce platform.

---

**Last Updated**: April 8, 2026
**Version**: 1.0.0
**Status**: ✅ Production Ready (Frontend)
