import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { queryClient } from "./lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import Landing from "@/pages/Landing";
import RoleSelection from "@/pages/RoleSelection";
import CustomerHome from "@/pages/customer/Home";
import Products from "@/pages/customer/Products";
import ProductDetail from "@/pages/customer/ProductDetail";
import Cart from "@/pages/customer/Cart";
import Checkout from "@/pages/customer/Checkout";
import Profile from "@/pages/customer/Profile";
import VendorDashboard from "@/pages/vendor/Dashboard";
import ProductManagement from "@/pages/vendor/ProductManagement";
import OrderManagement from "@/pages/vendor/OrderManagement";
import VendorSettings from "@/pages/vendor/Settings";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import { useEffect } from "react";
import { useLocation } from "wouter";
import Favorites from "@/pages/customer/Favorites";
import OrderDetail from "@/pages/customer/OrderDetail";
import Orders from "@/pages/customer/Orders";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location, setLocation] = useLocation();
  useEffect(() => {
    if (isAuthenticated && location === "/") {
      if (user?.role === "customer") {
        setLocation("/customer/home");
      } else if (user?.role === "vendor") {
        setLocation("/vendor/dashboard");
      }
    }
  }, [isAuthenticated, user, location, setLocation]);
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route component={Landing} />
      </Switch>
    );
  }
  // Show role selection for new users without a role
  if (user && (!user.role || user.role === "")) {
    return <RoleSelection />;
  }
  return (
    <Layout>
      <Switch>
        {/* Customer routes */}
        {user?.role === "customer" && (
          <>
            <Route path="/customer/home" component={CustomerHome} />
            <Route path="/products" component={Products} />
            <Route path="/products/:id" component={ProductDetail} />
            <Route path="/cart" component={Cart} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/profile" component={Profile} />
            <Route path="/favorites" component={Favorites} />
            <Route path="/orders" component={Orders} />
            <Route path="/orders/:id" component={OrderDetail} />
          </>
        )}

        {/* Vendor routes */}
        {user?.role === "vendor" && (
          <>
            <Route path="/vendor/dashboard" component={VendorDashboard} />
            <Route path="/vendor/products" component={ProductManagement} />
            <Route path="/vendor/orders" component={OrderManagement} />
            <Route path="/vendor/settings" component={VendorSettings} />
            <Route path="/profile" component={VendorSettings} />
          </>
        )}

        {/* Fallback */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
export default App;
