import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { OrderCardSkeleton } from "@/components/ui/SkeletonLoader";
import { 
  RotateCcw, 
  Search, 
  Calendar, 
  Eye, 
  PlayCircle,
  PauseCircle,
  XCircle,
  Users,
  Package,
  Clock,
  Mail,
  Phone
} from "lucide-react";
import type { Subscription } from "@/types";

export default function SubscriptionManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  const { data: subscriptions = [], isLoading, error } = useQuery({
    queryKey: ["/api/subscriptions"],
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/subscriptions/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      toast({
        title: "Subscription updated",
        description: "Subscription has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription",
        variant: "destructive",
      });
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/subscriptions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      toast({
        title: "Subscription cancelled",
        description: "Subscription has been cancelled successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    },
  });

  const filteredSubscriptions = subscriptions.filter((subscription: Subscription) => {
    const matchesSearch = 
      subscription.customer?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.customer?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.planType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "active" && subscription.isActive) ||
      (statusFilter === "inactive" && !subscription.isActive);

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const activeSubscriptions = subscriptions.filter((s: Subscription) => s.isActive).length;
  const totalRevenue = subscriptions.length * 29.99; // Assuming $29.99 per subscription
  const upcomingDeliveries = subscriptions.filter((s: Subscription) => {
    if (!s.nextDeliveryDate) return false;
    const deliveryDate = new Date(s.nextDeliveryDate);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return deliveryDate <= nextWeek && s.isActive;
  }).length;

  const handleToggleStatus = (subscription: Subscription) => {
    updateSubscriptionMutation.mutate({
      id: subscription.id,
      data: { isActive: !subscription.isActive }
    });
  };

  const handleCancelSubscription = (subscription: Subscription) => {
    if (confirm(`Are you sure you want to cancel ${subscription.customer?.firstName}'s subscription?`)) {
      cancelSubscriptionMutation.mutate(subscription.id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subscription Manager</h1>
          <p className="text-muted-foreground">Manage customer dessert box subscriptions</p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{activeSubscriptions}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{upcomingDeliveries}</div>
            <div className="text-sm text-muted-foreground">This Week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">${totalRevenue.toFixed(0)}</div>
            <div className="text-sm text-muted-foreground">Monthly Revenue</div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-card/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Subscribers</p>
                <p className="text-2xl font-bold text-foreground">{subscriptions.length}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <Users className="h-3 w-3 mr-1" />
                  Growing customer base
                </p>
              </div>
              <div className="w-12 h-12 gradient-sweet rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-card/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Monthly Revenue</p>
                <p className="text-2xl font-bold text-foreground">${totalRevenue.toFixed(0)}</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Recurring income
                </p>
              </div>
              <div className="w-12 h-12 gradient-mint rounded-xl flex items-center justify-center">
                <RotateCcw className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-card/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Upcoming Deliveries</p>
                <p className="text-2xl font-bold text-foreground">{upcomingDeliveries}</p>
                <p className="text-sm text-orange-600 flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Next 7 days
                </p>
              </div>
              <div className="w-12 h-12 gradient-warm rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg bg-card/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search subscriptions by customer name, email, or plan type..."
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
                <SelectItem value="all">All Subscriptions</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {filteredSubscriptions.length} subscriptions found
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
            <p className="text-destructive">Failed to load subscriptions. Please try again.</p>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <RotateCcw className="h-16 w-16 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No subscriptions found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" 
                  ? "Try adjusting your search criteria" 
                  : "Subscriptions will appear here when customers subscribe to your dessert boxes"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubscriptions.map((subscription: Subscription) => (
              <Card key={subscription.id} className="border-0 shadow-lg bg-card/50 card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold capitalize">
                          {subscription.planType} Subscription
                        </h3>
                        <Badge variant={subscription.isActive ? "default" : "secondary"}>
                          {subscription.isActive ? "Active" : "Paused"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Started: {formatDate(subscription.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Package className="h-4 w-4" />
                          <span>Next: {formatDate(subscription.nextDeliveryDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="text-xl font-bold text-primary">$29.99/month</p>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedSubscription(subscription)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <SubscriptionDetailsDialog subscription={selectedSubscription} />
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(subscription)}
                          disabled={updateSubscriptionMutation.isPending}
                        >
                          {subscription.isActive ? (
                            <>
                              <PauseCircle className="h-4 w-4 mr-1" />
                              Pause
                            </>
                          ) : (
                            <>
                              <PlayCircle className="h-4 w-4 mr-1" />
                              Resume
                            </>
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelSubscription(subscription)}
                          disabled={cancelSubscriptionMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar>
                      <AvatarImage src={subscription.customer?.profileImageUrl || ""} />
                      <AvatarFallback className="gradient-sweet text-white">
                        {subscription.customer?.firstName?.[0]}{subscription.customer?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {subscription.customer?.firstName} {subscription.customer?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {subscription.customer?.email}
                      </p>
                    </div>
                  </div>

                  {/* Preferences */}
                  {subscription.preferences && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Preferences:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(subscription.preferences as any).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key}: {Array.isArray(value) ? value.join(", ") : String(value)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Subscription Details Dialog Component
function SubscriptionDetailsDialog({ subscription }: { subscription: Subscription | null }) {
  if (!subscription) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Subscription Details</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Subscription Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Plan Type</p>
            <p className="font-medium capitalize">{subscription.planType} Subscription</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge variant={subscription.isActive ? "default" : "secondary"}>
              {subscription.isActive ? "Active" : "Paused"}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Start Date</p>
            <p className="font-medium">{formatDate(subscription.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Next Delivery</p>
            <p className="font-medium">{formatDate(subscription.nextDeliveryDate)}</p>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="font-semibold">Customer Information</h3>
          <div className="flex items-center space-x-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={subscription.customer?.profileImageUrl || ""} />
              <AvatarFallback className="gradient-sweet text-white">
                {subscription.customer?.firstName?.[0]}{subscription.customer?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="font-medium">
                {subscription.customer?.firstName} {subscription.customer?.lastName}
              </p>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{subscription.customer?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        {subscription.preferences && (
          <div className="space-y-3">
            <h3 className="font-semibold">Customer Preferences</h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(subscription.preferences as any).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="font-medium">
                      {Array.isArray(value) ? value.join(", ") : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Delivery Schedule */}
        <div className="space-y-3">
          <h3 className="font-semibold">Delivery Schedule</h3>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Frequency</p>
                <p className="font-medium capitalize">{subscription.planType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Delivery</p>
                <p className="font-medium">{formatDate(subscription.nextDeliveryDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4 pt-4 border-t">
          <Button variant="outline" className="flex-1">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Delivery
          </Button>
          <Button variant="outline" className="flex-1">
            <Mail className="h-4 w-4 mr-2" />
            Contact Customer
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
