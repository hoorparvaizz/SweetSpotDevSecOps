import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Home,
  Search,
  ShoppingCart,
  Heart,
  User,
  Package,
  BarChart3,
  Plus,
  ClipboardList,
  RotateCcw,
  Settings,
  Moon,
  Sun,
  Cookie,
} from "lucide-react";
export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const { cartCount } = useCart();
  const [location, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const customerNavItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Browse", path: "/products" },
    {
      icon: ShoppingCart,
      label: "Cart",
      path: "/cart",
      badge: cartCount > 0 ? cartCount : undefined,
    },
    { icon: Heart, label: "Favorites", path: "/favorites" },
    { icon: User, label: "Profile", path: "/profile" },
  ];
  const vendorNavItems = [
    { icon: BarChart3, label: "Dashboard", path: "/vendor/dashboard" },
    { icon: Package, label: "Products", path: "/vendor/products" },
    { icon: ClipboardList, label: "Orders", path: "/vendor/orders" },
    { icon: Settings, label: "Settings", path: "/vendor/settings" },
  ];
  const navItems = user?.role === "vendor" ? vendorNavItems : customerNavItems;
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center space-x-3 p-6 border-b border-border">
        <div className="w-10 h-10 gradient-sweet rounded-full flex items-center justify-center">
          <Cookie className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">SweetSpot</h1>
          <p className="text-sm text-muted-foreground">
            {user?.role === "vendor" ? "Vendor Portal" : "Artisan Desserts"}
          </p>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-6 py-3">
        <div
          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
            user?.role === "vendor"
              ? "bg-sweet-purple/20 text-sweet-purple"
              : "bg-sweet-pink/20 text-sweet-pink"
          }`}
        >
          {user?.role === "vendor" ? "🍰 Vendor" : "🛍️ Customer"}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          return (
            <Button
              key={item.path}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start relative ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              onClick={() => {
                setLocation(item.path);
                onClose();
              }}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
              {item.badge && (
                <span className="ml-auto bg-destructive text-destructive-foreground rounded-full px-2 py-1 text-xs">
                  {item.badge}
                </span>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="p-6 border-t border-border">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 mr-3" />
          ) : (
            <Moon className="w-5 h-5 mr-3" />
          )}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </Button>
      </div>
    </div>
  );
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto glass-effect border-r border-border">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="h-full overflow-y-auto">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
