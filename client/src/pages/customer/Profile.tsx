import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProductCard from "@/components/ui/ProductCard";
import { OrderCardSkeleton, ProductCardSkeleton } from "@/components/ui/SkeletonLoader";
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  Star,
  Clock
} from "lucide-react";
import type { Order, Subscription } from "@/types";

export default function Profile() {
  const { user } = useAuth();
  const { favorites, isLoading: favoritesLoading } = useFavorites();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useQuery({
    queryKey: ["/api/subscriptions"],
  });

  const getInitials = () => {
    return `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() || "U";
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "secondary";
      case "confirmed": return "default";
      case "preparing": return "default";
      case "ready": return "default";
      case "delivered": return "default";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  const formatOrderDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const recentOrders = orders.slice(0, 3);
  const totalSpent = orders.reduce((sum: number, order: Order) => 
    sum + parseFloat(order.total), 0
  );

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card className="border-0 shadow-lg bg-card/50">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user?.profileImageUrl || ""} />
              <AvatarFallback className="gradient-sweet text-white text-2xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {user?.firstName} {user?.lastName}
                </h1>
                <div className="flex items-center space-x-4 text-muted-foreground mt-2">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>{user?.email}</span>
                  </div>
                  <Badge variant="outline" className="bg-sweet-pink/10 text-sweet-pink border-sweet-pink/20">
                    Customer
                  </Badge>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{orders.length}</div>
                  <div className="text-sm text-muted-foreground">Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">${totalSpent.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Total Spent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{favorites.length}</div>
                  <div className="text-sm text-muted-foreground">Favorites</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card className="border-0 shadow-lg bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <OrderCardSkeleton key={i} />
                    ))}
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">No orders yet</p>
                    <p className="text-sm text-muted-foreground">Start shopping to see your orders here!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order: Order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                        <div className="space-y-1">
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatOrderDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="font-medium">${parseFloat(order.total).toFixed(2)}</p>
                          <Badge variant={getOrderStatusColor(order.status) as any}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="border-0 shadow-lg bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Member since {formatOrderDate(user?.createdAt)}
                    </span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card className="border-0 shadow-lg bg-card/50">
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <OrderCardSkeleton key={i} />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">No orders yet</h3>
                    <p className="text-muted-foreground">
                      When you place your first order, it will appear here.
                    </p>
                  </div>
                  <Button className="gradient-sweet text-white">
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order: Order) => (
                    <Card key={order.id} className="border shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold">Order #{order.id}</h3>
                            <p className="text-sm text-muted-foreground">
                              Placed on {formatOrderDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${parseFloat(order.total).toFixed(2)}</p>
                            <Badge variant={getOrderStatusColor(order.status) as any}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {order.orderItems.map((item) => (
                            <div key={item.id} className="flex items-center space-x-3 text-sm">
                              <span className="text-muted-foreground">{item.quantity}x</span>
                              <span className="flex-1">{item.product.name}</span>
                              <span className="font-medium">${parseFloat(item.totalPrice).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        
                        {order.estimatedDeliveryTime && (
                          <div className="flex items-center space-x-2 mt-4 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Estimated delivery: {formatOrderDate(order.estimatedDeliveryTime)}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Favorites Tab */}
        <TabsContent value="favorites" className="space-y-6">
          <Card className="border-0 shadow-lg bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Your Favorite Desserts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {favoritesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <Heart className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">No favorites yet</h3>
                    <p className="text-muted-foreground">
                      Save your favorite desserts to easily find them later.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((favorite) => (
                    <ProductCard key={favorite.id} product={favorite.product} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <Card className="border-0 shadow-lg bg-card/50">
            <CardHeader>
              <CardTitle>Your Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              {subscriptionsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <OrderCardSkeleton key={i} />
                  ))}
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="text-6xl">📦</div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">No subscriptions</h3>
                    <p className="text-muted-foreground">
                      Subscribe to get regular deliveries of your favorite desserts.
                    </p>
                  </div>
                  <Button className="gradient-sweet text-white">
                    Browse Subscription Options
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map((subscription: Subscription) => (
                    <Card key={subscription.id} className="border shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <h3 className="font-semibold">
                              {subscription.planType} Subscription
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Next delivery: {formatOrderDate(subscription.nextDeliveryDate)}
                            </p>
                          </div>
                          <div className="text-right space-y-2">
                            <Badge variant={subscription.isActive ? "default" : "destructive"}>
                              {subscription.isActive ? "Active" : "Paused"}
                            </Badge>
                            <div className="space-x-2">
                              <Button variant="outline" size="sm">
                                {subscription.isActive ? "Pause" : "Resume"}
                              </Button>
                              <Button variant="outline" size="sm">
                                Manage
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
