import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/components/ui/cart-provider";
import {
  Home,
  ShoppingCart,
  Heart,
  User,
  BarChart3,
  Package,
  Receipt,
  RotateCcw,
  Settings,
  Store,
  Cake,
} from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { state: cartState } = useCart();

  const customerNavItems: NavItem[] = [
    { path: "/", label: "Home", icon: Home },
    { path: "/products", label: "Products", icon: Cake },
    { 
      path: "/cart", 
      label: "Cart", 
      icon: ShoppingCart, 
      badge: cartState.items.length || undefined 
    },
    { path: "/profile", label: "Profile", icon: User },
  ];

  const vendorNavItems: NavItem[] = [
    { path: "/vendor/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/vendor/products", label: "Products", icon: Package },
    { path: "/vendor/orders", label: "Orders", icon: Receipt },
    { path: "/vendor/subscriptions", label: "Subscriptions", icon: RotateCcw },
    { path: "/vendor/settings", label: "Settings", icon: Settings },
  ];

  const navItems = user?.role === "vendor" ? vendorNavItems : customerNavItems;

  return (
    <div className="w-64 h-full bg-gradient-to-b from-sweet-pink via-sweet-purple to-purple-600 dark:from-purple-900 dark:via-purple-800 dark:to-purple-700 shadow-xl">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <Cake className="w-5 h-5 text-sweet-purple" />
          </div>
          <span className="text-xl font-bold text-white">SweetSpot</span>
        </div>

        {/* Role Badge */}
        <div className="mb-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="flex items-center justify-center space-x-2">
              {user?.role === "vendor" ? (
                <Store className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
              <span className="text-white font-medium capitalize">
                {user?.role || "Customer"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const IconComponent = item.icon;

            return (
              <Link key={item.path} href={item.path}>
                <a
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl text-white/80 hover:bg-white/20 hover:text-white transition-all duration-200",
                    isActive && "bg-white/20 text-white shadow-lg"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-sweet-yellow text-gray-800 text-xs font-bold px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Role Switcher */}
        <div className="mt-8 pt-8 border-t border-white/20">
          <Link href={user?.role === "vendor" ? "/" : "/vendor/dashboard"}>
            <a className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white/80 hover:bg-white/20 hover:text-white transition-all duration-200">
              {user?.role === "vendor" ? (
                <>
                  <User className="w-5 h-5" />
                  <span className="font-medium">Switch to Customer</span>
                </>
              ) : (
                <>
                  <Store className="w-5 h-5" />
                  <span className="font-medium">Switch to Vendor</span>
                </>
              )}
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
