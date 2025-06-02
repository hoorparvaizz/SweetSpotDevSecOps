import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

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

  return (
    <div className="space-y-8">
      <Card className="border-0 shadow-lg bg-card/50">
        <CardHeader>
          <CardTitle>Order #{order._id || order.id}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>Status: <span className="font-semibold">{order.status}</span></div>
            <div>Total: <span className="font-semibold">${parseFloat(order.total).toFixed(2)}</span></div>
            <div>Placed: {new Date(order.createdAt).toLocaleString()}</div>
            {/* Add more order details here as needed */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 