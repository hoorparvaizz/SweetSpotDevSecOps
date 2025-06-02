import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState } from "react";

export default function Orders() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/orders"],
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
  const formatOrderDate = (dateString) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order._id || order.id || "").toString().includes(searchQuery) ||
      order.orderItems?.some((item) =>
        item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <Card className="border-0 shadow-lg bg-card/50">
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search orders by ID or product name..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <LoadingSpinner size="lg" />
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
                  Orders you place will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order._id || order.id} className="border bg-card/80">
                  <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="font-semibold text-lg">
                        Order #{order._id || order.id}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Placed: {formatOrderDate(order.createdAt)}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Total: <span className="font-semibold">${parseFloat(order.total).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={getOrderStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => setLocation(`/orders/${order._id || order.id}`)}>
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 