import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getFullImageUrl } from "@/lib/utils";

export default function OrderDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const orderId = params.id;
  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/orders/" + orderId],
    enabled: !!orderId,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (error || !order) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Order Not Found</h2>
        <p className="text-muted-foreground">We couldn't find this order.</p>
        <Button onClick={() => setLocation("/profile")}>Go to Profile</Button>
      </div>
    );
  }

  // Debug logging
  console.log("Order data:", order);
  console.log("Order items:", order.orderItems);
  if (order.orderItems?.length > 0) {
    console.log("First item product:", order.orderItems[0].product);
    console.log("First item imageUrl:", order.orderItems[0].product?.imageUrl);
    if (order.orderItems[0].product?.imageUrl) {
      console.log("Full image URL:", getFullImageUrl(order.orderItems[0].product.imageUrl));
    }
  }

  return (
    <div className="space-y-8">
      {/* Order Header */}
      <Card className="border-0 shadow-lg bg-card/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl">Order #{order._id || order.id}</CardTitle>
          <Badge variant={getOrderStatusColor(order.status)} className="text-lg px-3 py-1">
            {order.status}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
              <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleTimeString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Items</p>
              <p className="font-medium">{order.orderItems?.length || 0} items</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="font-bold text-xl text-primary">${parseFloat(order.total).toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card className="border-0 shadow-lg bg-card/50">
        <CardHeader>
          <CardTitle>Order Items:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.orderItems?.map((item, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-muted/50">
                {/* Product Image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  {item.product?.imageUrl ? (
                    <img
                      src={getFullImageUrl(item.product.imageUrl)}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full gradient-sweet flex items-center justify-center">
                      <span className="text-white text-xl">🧁</span>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground">
                    {item.quantity}x {item.product?.name || 'Unknown Product'}
                  </h3>
                  {item.specialRequests && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Special requests: {item.specialRequests}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="text-right">
                  <p className="font-bold text-foreground">${parseFloat(item.totalPrice).toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">
                    ${parseFloat(item.unitPrice).toFixed(2)} each
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-muted-foreground text-center py-4">No items found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Back Button */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={() => setLocation("/orders")}>
          ← Back to Orders
        </Button>
      </div>
    </div>
  );
} 