import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Cookie, ShoppingBag, ChefHat, Users, Star, Award } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
export default function RoleSelection() {
  const [selectedRole, setSelectedRole] =
    (useState < "customer") | "vendor" | (null > null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const handleRoleSelection = async () => {
    if (!selectedRole) return;
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/role", { role: selectedRole });
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900 dark:to-rose-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 gradient-sweet rounded-2xl flex items-center justify-center shadow-lg">
              <Cookie className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              SweetSpot
            </h1>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Welcome to SweetSpot!
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose how you'd like to use our artisan dessert marketplace
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Customer Card */}
          <Card
            className={`cursor-pointer transition-all duration-300 border-2 hover:shadow-xl ${
              selectedRole === "customer"
                ? "border-purple-500 shadow-lg bg-purple-50/50 dark:bg-purple-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
            }`}
            onClick={() => setSelectedRole("customer")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 gradient-sweet rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                I'm a Customer
              </CardTitle>
              <p className="text-muted-foreground">
                Discover and order amazing desserts
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">
                    Browse artisan desserts from local vendors
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">
                    Save favorites and create wishlists
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">
                    Track orders and leave reviews
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">
                    Track orders and leave reviews
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span className="text-muted-foreground">
                      Join 25,000+ customers
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-muted-foreground">4.9/5 rating</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Card */}
          <Card
            className={`cursor-pointer transition-all duration-300 border-2 hover:shadow-xl ${
              selectedRole === "vendor"
                ? "border-pink-500 shadow-lg bg-pink-50/50 dark:bg-pink-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-pink-300"
            }`}
            onClick={() => setSelectedRole("vendor")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 gradient-mint rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                I'm a Vendor
              </CardTitle>
              <p className="text-muted-foreground">
                Sell your amazing dessert creations
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">
                    Showcase your artisan desserts
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">
                    Manage orders and inventory
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">
                    Analytics and insights
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <ChefHat className="w-4 h-4 text-pink-500" />
                    <span className="text-muted-foreground">
                      Join 150+ vendors
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="text-muted-foreground">Top platform</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={handleRoleSelection}
            disabled={!selectedRole || isLoading}
            className="gradient-sweet text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg px-12 py-6"
          >
            {isLoading ? "Setting up your account..." : "Continue to SweetSpot"}
          </Button>

          {selectedRole && (
            <p className="text-sm text-muted-foreground mt-4">
              You've selected:{" "}
              <span className="font-medium text-foreground">
                {selectedRole === "customer"
                  ? "Customer Account"
                  : "Vendor Account"}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
