import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { CartProvider } from "@/components/ui/cart-provider";
import { useAuth } from "@/hooks/useAuth";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Layout from "@/components/layout/Layout";

// Customer Pages
import Home from "@/pages/customer/Home";
import Products from "@/pages/customer/Products";
import ProductDetail from "@/pages/customer/ProductDetail";
import Cart from "@/pages/customer/Cart";
import Checkout from "@/pages/customer/Checkout";
import Profile from "@/pages/customer/Profile";

// Vendor Pages
import Dashboard from "@/pages/vendor/Dashboard";
import ManageProducts from "@/pages/vendor/ManageProducts";
import Orders from "@/pages/vendor/Orders";
import Subscriptions from "@/pages/vendor/Subscriptions";
import Settings from "@/pages/vendor/Settings";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-rose via-background to-pastel-purple">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 animate-spin rounded-full border-4 border-sweet-pink border-t-transparent"></div>
          <p className="text-muted-foreground">Loading SweetSpot...</p>
        </div>
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
        {/* Customer Routes */}
        <Route path="/" component={Home} />
        <Route path="/products" component={Products} />
        <Route path="/products/:id" component={ProductDetail} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/profile" component={Profile} />
        
        {/* Vendor Routes */}
        <Route path="/vendor/dashboard" component={Dashboard} />
        <Route path="/vendor/products" component={ManageProducts} />
        <Route path="/vendor/orders" component={Orders} />
        <Route path="/vendor/subscriptions" component={Subscriptions} />
        <Route path="/vendor/settings" component={Settings} />
        
        {/* Fallback */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="sweetspot-theme">
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
