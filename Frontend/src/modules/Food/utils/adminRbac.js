import { getCurrentUser } from "@food/utils/auth";

export const ADMIN_ACTIONS = ["view", "create", "edit", "delete", "export"];

export const ADMIN_PERMISSION_SECTIONS = [
  "dashboard",
  "point_of_sale",
  "food_management",
  "restaurant_management",
  "order_management",
  "service_management",
  "grocery_management",
  "accessories_management",
  "promotions_management",
  "referral_rewards",
  "customer_management",
  "delivery_management",
  "support_management",
  "report_management",
  "transaction_management",
  "banner_management",
  "pages_social_media",
  "zone_management",
  "system_settings",
];

const PATH_PREFIX_TO_SECTION = [
  { prefix: "/admin/food/point-of-sale", section: "point_of_sale" },
  { prefix: "/admin/food/fee-settings", section: "system_settings" },
  { prefix: "/admin/food/delivery-cash-limit", section: "delivery_management" },
  { prefix: "/admin/food/cash-limit-settlement", section: "delivery_management" },
  { prefix: "/admin/food/delivery-withdrawal", section: "delivery_management" },
  { prefix: "/admin/food/delivery-boy-wallet", section: "delivery_management" },
  { prefix: "/admin/food/delivery-emergency-help", section: "delivery_management" },
  { prefix: "/admin/food/delivery-support-tickets", section: "delivery_management" },
  { prefix: "/admin/food/delivery-order-reassignment-requests", section: "delivery_management" },
  { prefix: "/admin/food/food-approval", section: "food_management" },
  { prefix: "/admin/food/foods", section: "food_management" },
  { prefix: "/admin/food/addons", section: "food_management" },
  { prefix: "/admin/food/categories", section: "food_management" },
  { prefix: "/admin/food/zones", section: "zone_management" },
  { prefix: "/admin/food/restaurants", section: "restaurant_management" },
  { prefix: "/admin/food/restaurant-commissions", section: "restaurant_management" },
  { prefix: "/admin/food/orders", section: "order_management" },
  { prefix: "/admin/food/global-orders", section: "order_management" },
  { prefix: "/admin/food/order-refunds", section: "order_management" },
  { prefix: "/admin/food/order-detect-delivery", section: "order_management" },
  { prefix: "/admin/food/services", section: "service_management" },
  { prefix: "/admin/food/service-categories", section: "service_management" },
  { prefix: "/admin/food/bookings", section: "service_management" },
  { prefix: "/admin/food/grocery-products", section: "grocery_management" },
  { prefix: "/admin/food/grocery-categories", section: "grocery_management" },
  { prefix: "/admin/food/grocery-orders", section: "grocery_management" },
  { prefix: "/admin/food/accessories", section: "accessories_management" },
  { prefix: "/admin/food/accessories-products", section: "accessories_management" },
  { prefix: "/admin/food/accessories-categories", section: "accessories_management" },
  { prefix: "/admin/food/accessories-orders", section: "accessories_management" },
  { prefix: "/admin/food/coupons", section: "promotions_management" },
  { prefix: "/admin/food/campaigns", section: "promotions_management" },
  { prefix: "/admin/food/cashback", section: "promotions_management" },
  { prefix: "/admin/food/banners", section: "banner_management" },
  { prefix: "/admin/food/advertisement", section: "promotions_management" },
  { prefix: "/admin/food/referral-settings", section: "referral_rewards" },
  { prefix: "/admin/food/customers", section: "customer_management" },
  { prefix: "/admin/food/support-tickets", section: "customer_management" },
  { prefix: "/admin/food/wallet", section: "customer_management" },
  { prefix: "/admin/food/loyalty-point", section: "customer_management" },
  { prefix: "/admin/food/subscribed-mail-list", section: "customer_management" },
  { prefix: "/admin/food/delivery", section: "delivery_management" },
  { prefix: "/admin/food/delivery-partners", section: "delivery_management" },
  { prefix: "/admin/food/contact-messages", section: "support_management" },
  { prefix: "/admin/food/chattings", section: "support_management" },
  { prefix: "/admin/food/safety-emergency-reports", section: "support_management" },
  { prefix: "/admin/food/transaction-report", section: "report_management" },
  { prefix: "/admin/food/order-report", section: "report_management" },
  { prefix: "/admin/food/tax-report", section: "report_management" },
  { prefix: "/admin/food/restaurant-report", section: "report_management" },
  { prefix: "/admin/food/expense-report", section: "report_management" },
  { prefix: "/admin/food/disbursement-report", section: "report_management" },
  { prefix: "/admin/food/restaurant-vat-report", section: "report_management" },
  { prefix: "/admin/food/restaurant-withdraws", section: "transaction_management" },
  { prefix: "/admin/food/withdraw-method", section: "transaction_management" },
  { prefix: "/admin/food/customer-report", section: "report_management" },
  { prefix: "/admin/food/hero-banner-management", section: "banner_management" },
  { prefix: "/admin/food/landing-page-settings", section: "banner_management" },
  { prefix: "/admin/food/feature-settings", section: "system_settings" },
  { prefix: "/admin/food/power-scanning", section: "system_settings" },
  { prefix: "/admin/food/business-setup", section: "system_settings" },
  { prefix: "/admin/food/broadcast-notification", section: "system_settings" },
  { prefix: "/admin/food/notification", section: "system_settings" },
  { prefix: "/admin/food/notifications", section: "system_settings" },
  { prefix: "/admin/food/notification-channels", section: "system_settings" },
  { prefix: "/admin/food/coin-settings", section: "system_settings" },
  { prefix: "/admin/food/coin-requests", section: "system_settings" },
  { prefix: "/admin/food/email-template", section: "system_settings" },
  { prefix: "/admin/food/theme-settings", section: "system_settings" },
  { prefix: "/admin/food/gallery", section: "system_settings" },
  { prefix: "/admin/food/login-setup", section: "system_settings" },
  { prefix: "/admin/food/page-meta-data", section: "system_settings" },
  { prefix: "/admin/food/react-site", section: "system_settings" },
  { prefix: "/admin/food/clean-database", section: "system_settings" },
  { prefix: "/admin/food/addon-activation", section: "system_settings" },
  { prefix: "/admin/food/3rd-party-configurations", section: "system_settings" },
  { prefix: "/admin/food/app-web-settings", section: "system_settings" },
  { prefix: "/admin/food/pages-social-media", section: "pages_social_media" },
  { prefix: "/admin/food/employees", section: "sub_admin_management" },
  { prefix: "/admin/food/employee-role", section: "sub_admin_management" },
];

const ALWAYS_ALLOWED_FOR_SUB_ADMIN = new Set([
  "/admin/food/profile",
  "/admin/food/settings",
]);

export function isSuperAdmin(adminUser) {
  if (!adminUser) return true;
  const type = String(adminUser?.adminType || "").trim().toLowerCase();
  if (type === "super_admin" || type === "admin" || adminUser?.isSuperAdmin === true) return true;
  const role = String(adminUser?.role || "").trim().toUpperCase();
  if (role === "ADMIN" || role === "SUPER_ADMIN" || role === "SUPERADMIN") return true;
  if (type === "sub_admin") return false;
  return true;
}

export function getAdminPermissions(adminUser) {
  return adminUser?.effectivePermissions || adminUser?.permissions || {};
}

export function canAdminAccess(adminUser, section, action = "view") {
  if (!section) return true;
  if (isSuperAdmin(adminUser)) return true;
  const permissions = getAdminPermissions(adminUser);
  const actions = Array.isArray(permissions?.[section]) ? permissions[section] : [];
  return actions.includes(action);
}

export function resolvePermissionSectionByPath(pathname = "") {
  if (pathname === "/admin/food" || pathname === "/admin/food/") return "dashboard";
  const match = PATH_PREFIX_TO_SECTION.find((item) => pathname.startsWith(item.prefix));
  return match?.section || null;
}

export function canAccessAdminPath(pathname, action = "view") {
  const adminUser = getCurrentUser("admin");
  if (!adminUser || isSuperAdmin(adminUser)) return true;
  const section = resolvePermissionSectionByPath(pathname);
  if (!section) {
    return true;
  }
  return canAdminAccess(adminUser, section, action);
}

export function canCurrentAdminAction(action = "view", pathname = "") {
  const adminUser = getCurrentUser("admin");
  const currentPath =
    pathname || (typeof window !== "undefined" ? window.location.pathname : "");
  const section = resolvePermissionSectionByPath(currentPath);
  if (!section) {
    return isSuperAdmin(adminUser);
  }
  return canAdminAccess(adminUser, section, action);
}

export function findFirstAllowedAdminPath(adminUser) {
  const sectionHomePath = {
    dashboard: "/admin/food",
    point_of_sale: "/admin/food/point-of-sale",
    food_management: "/admin/food/food-approval",
    restaurant_management: "/admin/food/restaurants",
    order_management: "/admin/food/orders/all",
    promotions_management: "/admin/food/coupons",
    referral_rewards: "/admin/food/referral-settings",
    customer_management: "/admin/food/customers",
    delivery_management: "/admin/food/delivery-partners",
    support_management: "/admin/food/contact-messages",
    report_management: "/admin/food/transaction-report",
    transaction_management: "/admin/food/restaurant-withdraws",
    banner_management: "/admin/food/hero-banner-management",
    pages_social_media: "/admin/food/pages-social-media/about",
  };

  if (isSuperAdmin(adminUser)) {
    return "/admin/food";
  }

  for (const section of ADMIN_PERMISSION_SECTIONS) {
    if (canAdminAccess(adminUser, section, "view")) {
      return sectionHomePath[section] || "/admin/food/profile";
    }
  }

  return "/admin/food/profile";
}
