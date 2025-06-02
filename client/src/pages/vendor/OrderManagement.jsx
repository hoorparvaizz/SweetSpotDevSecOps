import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { OrderCardSkeleton } from "@/components/ui/SkeletonLoader";
import { getFullImageUrl } from "@/lib/utils";
import {
  Package,
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";

export default function OrderManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "/api/orders",
      { status: statusFilter !== "all" ? statusFilter : undefined },
    ],
  });
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }) => {
      const response = await apiRequest(
        "PUT",
        `/api/orders/${orderId}/status`,
        { status },
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order updated",
        description: "Order status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    },
  });
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order._id || "").toString().includes(searchQuery) ||
      order.customer?.firstName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      order.customer?.lastName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });
  const getStatusColor = (status) => {
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
  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return Clock;
      case "confirmed":
        return CheckCircle;
      case "preparing":
        return Package;
      case "ready":
        return Truck;
      case "delivered":
        return CheckCircle;
      case "cancelled":
        return XCircle;
      default:
        return Clock;
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const orderStatuses = [
    {
      value: "pending",
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "confirmed",
      label: "Confirmed",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "preparing",
      label: "Preparing",
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "ready",
      label: "Ready for Delivery",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "delivered",
      label: "Delivered",
      color: "bg-gray-100 text-gray-800",
    },
    {
      value: "cancelled",
      label: "Cancelled",
      color: "bg-red-100 text-red-800",
    },
  ];
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const todayOrders = orders.filter((o) => {
    const orderDate = new Date(o.createdAt || "");
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }).length;
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Order Management
          </h1>
          <p className="text-muted-foreground">
            Track and manage customer orders
          </p>
        </div>
        <div className="flex space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {pendingOrders}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{todayOrders}</div>
            <div className="text-sm text-muted-foreground">Today</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg bg-card/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search orders by ID, customer name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                {orderStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {filteredOrders.length} orders found
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">
              Failed to load orders. Please try again.
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <Package className="h-16 w-16 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No orders found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search criteria"
                  : "Orders will appear here when customers start buying your products"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const StatusIcon = getStatusIcon(order.status);
              return (
                <Card
                  key={order._id}
                  className="border-0 shadow-lg bg-card/50 card-hover"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold">
                            Order #{order._id}
                          </h3>
                          <Badge variant={getStatusColor(order.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Package className="h-4 w-4" />
                            <span>{order.orderItems.length} items</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="text-xl font-bold text-primary">
                          ${parseFloat(order.total).toFixed(2)}
                        </p>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <OrderDetailsDialog
                              order={selectedOrder}
                              onStatusUpdate={(orderId, status) =>
                                updateOrderStatusMutation.mutate({
                                  orderId,
                                  status,
                                })
                              }
                              isUpdating={updateOrderStatusMutation.isPending}
                            />
                          </Dialog>
                          {order.status !== "delivered" &&
                            order.status !== "cancelled" && (
                              <Select
                                value={order.status}
                                onValueChange={(status) =>
                                  updateOrderStatusMutation.mutate({
                                    orderId: order._id,
                                    status,
                                  })
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {orderStatuses
                                    .filter((s) => s.value !== "cancelled")
                                    .map((status) => (
                                      <SelectItem
                                        key={status.value}
                                        value={status.value}
                                      >
                                        {status.label}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            )}
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar>
                        <AvatarImage
                          src={order.customer?.profileImageUrl || ""}
                        />
                        <AvatarFallback className="gradient-sweet text-white">
                          {order.customer?.firstName?.[0]}
                          {order.customer?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {order.customer?.firstName} {order.customer?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.customer?.email}
                        </p>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Order Items:
                      </p>
                      <div className="space-y-1">
                        {order.orderItems.slice(0, 3).map((item, index) => (
                          <div
                            key={item._id || item.id || index}
                            className="flex items-center justify-between text-sm"
                          >
                            <span>
                              {item.quantity}x {item.product?.name || 'Deleted Product'}
                            </span>
                            <span className="font-medium">
                              ${parseFloat(item.totalPrice).toFixed(2)}
                            </span>
                          </div>
                        ))}
                        {order.orderItems.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{order.orderItems.length - 3} more items
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Special Instructions */}
                    {order.specialInstructions && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Special Instructions:
                        </p>
                        <p className="text-sm">{order.specialInstructions}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
// Order Details Dialog Component
function OrderDetailsDialog({ order, onStatusUpdate, isUpdating }) {
  if (!order) return null;
  const deliveryAddress = order.deliveryAddress;
  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Order #{order._id} Details</DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Order Status */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Order Status</p>
            <Badge
              variant={order.status === "delivered" ? "default" : "secondary"}
              className="mt-1"
            >
              {order.status}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Order Total</p>
            <p className="text-xl font-bold text-primary">
              ${parseFloat(order.total).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="font-semibold">Customer Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={order.customer?.profileImageUrl || ""} />
                  <AvatarFallback className="gradient-sweet text-white text-sm">
                    {order.customer?.firstName?.[0]}
                    {order.customer?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {order.customer?.firstName} {order.customer?.lastName}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{order.customer?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        {deliveryAddress && (
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Delivery Address
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-1">
              <p className="font-medium">
                {deliveryAddress.firstName} {deliveryAddress.lastName}
              </p>
              <p>{deliveryAddress.address}</p>
              <p>
                {deliveryAddress.city}, {deliveryAddress.state}{" "}
                {deliveryAddress.zipCode}
              </p>
              {deliveryAddress.phone && (
                <div className="flex items-center space-x-2 text-sm pt-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{deliveryAddress.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="space-y-3">
          <h3 className="font-semibold">Order Items</h3>
          <div className="space-y-3">
            {order.orderItems.map((item, index) => (
              <div
                key={item._id || item.id || index}
                className="flex items-center space-x-4 p-3 border rounded-lg"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  {item.product?.imageUrl ? (
                    <img
                      src={getFullImageUrl(item.product.imageUrl)}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full gradient-sweet flex items-center justify-center">
                      <span className="text-white text-lg">🧁</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{item.product?.name || 'Deleted Product'}</h4>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity} × $
                    {parseFloat(item.unitPrice).toFixed(2)}
                  </p>
                  {item.specialRequests && (
                    <p className="text-sm text-muted-foreground italic">
                      Note: {item.specialRequests}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ${parseFloat(item.totalPrice).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-2 border-t pt-4">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${parseFloat(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Delivery Fee</span>
            <span>${parseFloat(order.deliveryFee).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>${parseFloat(order.tax).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t pt-2">
            <span>Total</span>
            <span className="text-primary">
              ${parseFloat(order.total).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Special Instructions */}
        {order.specialInstructions && (
          <div className="space-y-2">
            <h3 className="font-semibold">Special Instructions</h3>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm">{order.specialInstructions}</p>
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  );
}
