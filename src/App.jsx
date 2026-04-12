import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { LanguageProvider } from "./context/LanguageContext";
import { UserProvider } from "./context/UserContext";
import { AuthProvider } from "./context/AuthContext";
import BottomNav from "./components/BottomNav";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import FoodPage from "./pages/FoodPage";
import ServicesPage from "./pages/ServicesPage";
import PartnerPage from "./pages/PartnerPage";
import CheckoutPage from "./pages/CheckoutPage";
import CartPage from "./pages/CartPage";
import ProfilePage from "./pages/ProfilePage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";
import DeliveryPolicyPage from "./pages/DeliveryPolicyPage";
import SearchPage from "./pages/SearchPage";
import NotFoundPage from "./pages/NotFoundPage";
import CategoryBrowserPage from "./pages/CategoryBrowserPage";
import { CATEGORY_BROWSER_VARIANTS } from "./data/categoryBrowserData";
import VillageBrowserPage from "./pages/VillageBrowserPage";
import QuickPage from "./pages/QuickPage";
import AdminRewardsPage from "./pages/AdminRewardsPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AccessDeniedPage from "./pages/AccessDeniedPage";
import AdminDashboard from "./pages/AdminDashboard";
import ShopDashboard from "./pages/ShopDashboard";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import DeliveryOrdersPage from "./pages/DeliveryOrdersPage";
import DeliveryOrderDetailPage from "./pages/DeliveryOrderDetailPage";
import AdminDeliveryPage from "./pages/AdminDeliveryPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import PartnerOnboardingPage from "./pages/PartnerOnboardingPage";
import ShopJoinPage from "./pages/ShopJoinPage";
import ShopStatusPage from "./pages/ShopStatusPage";
import ServicePartnerOnboardingPage from "./pages/ServicePartnerOnboardingPage";
import AdminPartnersPage from "./pages/AdminPartnersPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminCategoriesPage from "./pages/AdminCategoriesPage";
import AdminOffersPage from "./pages/AdminOffersPage";
import AdminServicesPage from "./pages/AdminServicesPage";
import AdminShopApplicationsPage from "./pages/AdminShopApplicationsPage";
import AdminShopsPage from "./pages/AdminShopsPage";
import AdminLaunchChecklistPage from "./pages/AdminLaunchChecklistPage";
import { removeExpiredRewards } from "./utils/rewardWallet";
import { NotificationsProvider } from "./context/NotificationsContext";
import ConnectivityBanner from "./components/ConnectivityBanner";

function App() {
  useEffect(() => {
    removeExpiredRewards();
  }, []);

  return (
    <Router>
      <LanguageProvider>
        <CartProvider>
          <UserProvider>
            <AuthProvider>
            <NotificationsProvider>
            <div className="min-h-screen bg-gradient-to-b from-orange-100 via-amber-100 to-emerald-100 pb-16">
              <ConnectivityBanner />
              <Routes>
                {/* Main Routes */}
                <Route path="/" element={<HomePage />} />

                {/* Food Routes */}
                <Route path="/food" element={<FoodPage />} />
                <Route path="/daily" element={<FoodPage />} />

                {/* Services Routes */}
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/become-partner" element={<PartnerPage />} />
                <Route path="/list-your-shop" element={<PartnerPage />} />
                <Route path="/partners/apply" element={<PartnerOnboardingPage />} />
                <Route path="/partner/join" element={<ShopJoinPage />} />
                <Route path="/partner/status" element={<ShopStatusPage />} />
                <Route path="/service-partners/apply" element={<ServicePartnerOnboardingPage />} />

                {/* Cart & Profile Routes */}
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/checkout/address" element={<CheckoutPage />} />
                <Route path="/checkout/summary" element={<CheckoutPage />} />
                <Route path="/checkout/payment" element={<CheckoutPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/orders" element={<OrderHistoryPage />} />
                <Route path="/my-orders" element={<ProtectedRoute roles={["customer", "owner"]}><OrderHistoryPage /></ProtectedRoute>} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/refund-policy" element={<RefundPolicyPage />} />
                <Route path="/delivery-policy" element={<DeliveryPolicyPage />} />
                <Route path="/order-confirmed/:id?" element={<OrderConfirmationPage />} />
                <Route path="/track-order/:id?" element={<OrderTrackingPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route
                  path="/categories"
                  element={<CategoryBrowserPage mode={CATEGORY_BROWSER_VARIANTS.CATEGORIES} />}
                />
                <Route
                  path="/village"
                  element={<VillageBrowserPage />}
                />
                <Route path="/quick" element={<QuickPage />} />
                <Route path="/admin-rewards" element={<AdminRewardsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/access-denied" element={<AccessDeniedPage />} />
                <Route path="/admin/dashboard" element={<ProtectedRoute roles={["owner"]}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/orders" element={<ProtectedRoute roles={["owner"]}><AdminOrdersPage /></ProtectedRoute>} />
                <Route path="/test-orders" element={<ProtectedRoute roles={["owner"]}><AdminOrdersPage /></ProtectedRoute>} />
                <Route path="/admin-order-status" element={<ProtectedRoute roles={["owner"]}><AdminOrdersPage /></ProtectedRoute>} />
                <Route path="/admin/order-tools" element={<ProtectedRoute roles={["owner"]}><AdminOrdersPage /></ProtectedRoute>} />
                <Route path="/admin/delivery" element={<ProtectedRoute roles={["owner"]}><AdminDeliveryPage /></ProtectedRoute>} />
                <Route path="/admin/delivery/orders" element={<ProtectedRoute roles={["owner"]}><AdminDeliveryPage /></ProtectedRoute>} />
                <Route path="/admin/shops/applications" element={<ProtectedRoute roles={["owner"]}><AdminShopApplicationsPage /></ProtectedRoute>} />
                <Route path="/admin/shops" element={<ProtectedRoute roles={["owner"]}><AdminShopsPage /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute roles={["owner"]}><AdminUsersPage /></ProtectedRoute>} />
                <Route path="/admin/partners" element={<ProtectedRoute roles={["owner"]}><AdminPartnersPage /></ProtectedRoute>} />
                <Route path="/admin/analytics" element={<ProtectedRoute roles={["owner"]}><AdminAnalyticsPage /></ProtectedRoute>} />
                <Route path="/admin/products" element={<ProtectedRoute roles={["owner"]}><AdminProductsPage /></ProtectedRoute>} />
                <Route path="/admin/categories" element={<ProtectedRoute roles={["owner"]}><AdminCategoriesPage /></ProtectedRoute>} />
                <Route path="/admin/offers" element={<ProtectedRoute roles={["owner"]}><AdminOffersPage /></ProtectedRoute>} />
                <Route path="/admin/services" element={<ProtectedRoute roles={["owner"]}><AdminServicesPage /></ProtectedRoute>} />
                <Route path="/admin/launch-checklist" element={<ProtectedRoute roles={["owner"]}><AdminLaunchChecklistPage /></ProtectedRoute>} />
                <Route path="/owner/dashboard" element={<ProtectedRoute roles={["owner"]}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/owner/orders" element={<ProtectedRoute roles={["owner"]}><AdminOrdersPage /></ProtectedRoute>} />
                <Route path="/owner/products" element={<ProtectedRoute roles={["owner"]}><AdminProductsPage /></ProtectedRoute>} />
                <Route path="/owner/shops" element={<ProtectedRoute roles={["owner"]}><AdminShopsPage /></ProtectedRoute>} />
                <Route path="/owner/analytics" element={<ProtectedRoute roles={["owner"]}><AdminAnalyticsPage /></ProtectedRoute>} />
                <Route path="/owner/users" element={<ProtectedRoute roles={["owner"]}><AdminUsersPage /></ProtectedRoute>} />
                <Route path="/shop/dashboard" element={<ProtectedRoute roles={["shop_admin", "owner"]}><ShopDashboard /></ProtectedRoute>} />
                <Route path="/shop/products" element={<ProtectedRoute roles={["shop_admin", "owner"]}><ShopDashboard /></ProtectedRoute>} />
                <Route path="/shop/orders" element={<ProtectedRoute roles={["shop_admin", "owner"]}><ShopDashboard /></ProtectedRoute>} />
                <Route path="/shop/offers" element={<ProtectedRoute roles={["shop_admin", "owner"]}><ShopDashboard /></ProtectedRoute>} />
                <Route path="/delivery/dashboard" element={<ProtectedRoute roles={["delivery", "owner"]}><DeliveryDashboard /></ProtectedRoute>} />
                <Route path="/delivery/orders" element={<ProtectedRoute roles={["delivery", "owner"]}><DeliveryOrdersPage /></ProtectedRoute>} />
                <Route path="/delivery/order/:id" element={<ProtectedRoute roles={["delivery", "owner"]}><DeliveryOrderDetailPage /></ProtectedRoute>} />
                <Route path="/delivery/profile" element={<ProtectedRoute roles={["delivery", "owner"]}><DeliveryDashboard /></ProtectedRoute>} />
                <Route path="/rider/dashboard" element={<ProtectedRoute roles={["delivery", "owner"]}><DeliveryDashboard /></ProtectedRoute>} />

                {/* Category Routes */}
                <Route path="/admin" element={<ProtectedRoute roles={["owner"]}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin-products" element={<ProtectedRoute roles={["owner"]}><AdminProductsPage /></ProtectedRoute>} />
                <Route path="/admin-orders" element={<ProtectedRoute roles={["owner"]}><AdminOrdersPage /></ProtectedRoute>} />
                <Route path="/:slug" element={<CategoryPage />} />

                {/* 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              
              <BottomNav />
            </div>
            </NotificationsProvider>
            </AuthProvider>
          </UserProvider>
        </CartProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
