import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { queryClient } from "./lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import Landing from "@/pages/Landing";
import CustomerHome from "@/pages/customer/Home";
import Products from "@/pages/customer/Products";
import ProductDetail from "@/pages/customer/ProductDetail";
import Cart from "@/pages/customer/Cart";
import Checkout from "@/pages/customer/Checkout";
import Profile from "@/pages/customer/Profile";
import VendorDashboard from "@/pages/vendor/Dashboard";
import ProductManagement from "@/pages/vendor/ProductManagement";
import OrderManagement from "@/pages/vendor/OrderManagement";
import SubscriptionManager from "@/pages/vendor/SubscriptionManager";
import VendorSettings from "@/pages/vendor/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

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
        <Route component={Landing} />
      </Switch>
    );
  }

  return (
    <Layout>
      <Switch>
        {/* Customer routes */}
        <Route path="/" component={CustomerHome} />
        <Route path="/products" component={Products} />
        <Route path="/products/:id" component={ProductDetail} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/profile" component={Profile} />
        
        {/* Vendor routes */}
        {user?.role === "vendor" && (
          <>
            <Route path="/vendor/dashboard" component={VendorDashboard} />
            <Route path="/vendor/products" component={ProductManagement} />
            <Route path="/vendor/orders" component={OrderManagement} />
            <Route path="/vendor/subscriptions" component={SubscriptionManager} />
            <Route path="/vendor/settings" component={VendorSettings} />
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
