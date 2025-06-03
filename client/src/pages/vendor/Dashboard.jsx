import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  DollarSign,
  Package,
  ShoppingBag,
  Star,
  TrendingUp,
  Plus,
  Eye,
  Calendar,
  Clock,
} from "lucide-react";

export default function VendorDashboard() {
  const [, setLocation] = useLocation();
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/vendor/stats"],
  });
  const { data: recentOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders", { limit: 5 }],
  });
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/vendor/products"],
  });
  const getOrderStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "confirmed":
        return "default";
      case "preparing":
        return "default";
      case "ready":
        return "default";
      case "delivered":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const lowStockProducts = products.filter((p) => p.stock <= 5);
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Vendor Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your dessert business</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setLocation("/vendor/orders")}
          >
            View All Orders
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-lg bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="w-12 h-12 bg-muted rounded-xl animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="border-0 shadow-lg bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Sales
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      ${stats?.totalSales?.toFixed(2) || "0.00"}
                    </p>
                    <p className="text-sm text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12% from last month
                    </p>
                  </div>
                  <div className="w-12 h-12 gradient-mint rounded-xl flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.totalOrders || 0}
                    </p>
                    <p className="text-sm text-blue-600 flex items-center">
                      <Package className="h-3 w-3 mr-1" />
                      {
                        recentOrders.filter((o) => o.status === "pending")
                          .length
                      }{" "}
                      pending
                    </p>
                  </div>
                  <div className="w-12 h-12 gradient-sweet rounded-xl flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Active Products
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.activeProducts || 0}
                    </p>
                    <p className="text-sm text-orange-600 flex items-center">
                      <Package className="h-3 w-3 mr-1" />
                      {lowStockProducts.length} low stock
                    </p>
                  </div>
                  <div className="w-12 h-12 gradient-warm rounded-xl flex items-center justify-center">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Average Rating
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.averageRating?.toFixed(1) || "0.0"}
                    </p>
                    <p className="text-sm text-yellow-600 flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      From customer reviews
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card className="border-0 shadow-lg bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/vendor/orders")}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border rounded-xl"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="space-y-2 text-right">
                      <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                      <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" />
                <div className="space-y-2">
                  <h3 className="font-semibold">No orders yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Orders will appear here when customers start buying your
                    products.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.slice(0, 5).map((order) => (
                  <div
                    key={order._id || order.id}
                    className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">Order #{order._id || order.id}</h4>
                        <Badge
                          variant={getOrderStatusColor(order.status)}
                          className="text-xs"
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.customer?.firstName} {order.customer?.lastName}
                      </p>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-semibold">
                        ${parseFloat(order.total).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.orderItems.length} items
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Low Stock Alert */}
          {lowStockProducts.length > 0 && (
            <Card className="border-0 shadow-lg bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Low Stock Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
                  {lowStockProducts.length} products are running low on stock
                </p>
                <div className="space-y-2">
                  {lowStockProducts.slice(0, 3).map((product) => (
                    <div
                      key={product._id || product.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="font-medium">{product.name}</span>
                      <Badge
                        variant="outline"
                        className="text-orange-600 border-orange-300"
                      >
                        {product.stock} left
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full border-orange-300 text-orange-700 hover:bg-orange-100"
                  onClick={() => setLocation("/vendor/products")}
                >
                  Manage Inventory
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg bg-card/50">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setLocation("/vendor/orders")}
              >
                <Eye className="h-4 w-4 mr-2" />
                View All Orders
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setLocation("/vendor/products")}
              >
                <Package className="h-4 w-4 mr-2" />
                Manage Products
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
