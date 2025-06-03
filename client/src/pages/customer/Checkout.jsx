import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart } from "@/hooks/useCart";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { MapPin, CreditCard, Clock, Check } from "lucide-react";
import { z } from "zod";
import { getFullImageUrl } from "@/lib/utils";

// Swiggy-style checkout schema
const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(3, "ZIP code is required"),
  cardNumber: z.string().min(12, "Card number is required"),
  expiryDate: z.string().min(3, "Expiry date is required"),
  cvv: z.string().min(3, "CVV is required"),
  cardName: z.string().min(1, "Name on card is required"),
  deliveryTime: z.string().min(1, "Delivery time is required"),
  specialInstructions: z.string().optional(),
});

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const form = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryTime: "asap",
    },
  });
  const deliveryFee = 3.99;
  const taxRate = 0.08;
  const subtotal = cartTotal;
  const tax = subtotal * taxRate;
  const total = subtotal + deliveryFee + tax;
  const createOrderMutation = useMutation({
    mutationFn: async (data) => {
      const orderData = {
        vendorId: cartItems[0]?.product.vendorId || cartItems[0]?.product.vendorId || cartItems[0]?.product._id, // fallback for _id
        status: "pending",
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        deliveryFee: deliveryFee.toString(),
        total: total.toString(),
        deliveryAddress: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
        },
        specialInstructions: data.specialInstructions,
      };
      const orderItems = cartItems.map((item) => ({
        productId: item.product?._id || item.productId,
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice: (parseFloat(item.product.price) * item.quantity).toString(),
        specialRequests: item.specialRequests,
      }));
      const response = await apiRequest("POST", "/api/orders", {
        orderData,
        orderItems,
      });
      return response;
    },
    onSuccess: (order) => {
      toast({
        title: "Order placed successfully!",
        description: `Your order #${order._id || order.id} has been placed and will be prepared shortly.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      clearCart.mutate();
      setLocation(`/orders/${order._id || order.id}`);
    },
    onError: (error) => {
      toast({
        title: "Order failed",
        description:
          error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    },
  });
  if (cartItems.length === 0) {
    return (
      <div className="text-center py-16 space-y-6">
        <h2 className="text-2xl font-bold text-foreground">
          No items to checkout
        </h2>
        <p className="text-muted-foreground">
          Add some delicious desserts to your cart first!
        </p>
        <Button onClick={() => setLocation("/products")}>
          Browse Products
        </Button>
      </div>
    );
  }
  const onSubmit = async (data) => {
    setIsProcessing(true);
    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await createOrderMutation.mutateAsync(data);
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
        <p className="text-muted-foreground">Complete your order details</p>
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-80">
            <CardContent className="p-8 text-center space-y-4">
              <LoadingSpinner size="lg" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  Processing your order...
                </h3>
                <p className="text-sm text-muted-foreground">
                  Please don't close this page while we process your payment
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid lg:grid-cols-3 gap-8"
        >
          {/* Order Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery Information */}
            <Card className="border-0 shadow-lg bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="NY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="border-0 shadow-lg bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <Input placeholder="1234 5678 9012 3456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input placeholder="MM/YY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cvv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVV</FormLabel>
                        <FormControl>
                          <Input placeholder="123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="cardName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name on Card</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Order Preferences */}
            <Card className="border-0 shadow-lg bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Delivery Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="deliveryTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Delivery Time</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select delivery time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="asap">
                            As soon as possible
                          </SelectItem>
                          <SelectItem value="morning">
                            Morning (8AM - 12PM)
                          </SelectItem>
                          <SelectItem value="afternoon">
                            Afternoon (12PM - 5PM)
                          </SelectItem>
                          <SelectItem value="evening">
                            Evening (5PM - 8PM)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Instructions (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any special delivery instructions..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg bg-card/50 sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.imageUrl ? (
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
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} × $
                          {parseFloat(item.product.price).toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium text-sm">
                        $
                        {(
                          parseFloat(item.product.price) * item.quantity
                        ).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full gradient-sweet text-white"
                  disabled={createOrderMutation.isPending || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>

                {/* Security Notice */}
                <div className="text-xs text-center text-muted-foreground">
                  <p>🔒 Your payment information is secure</p>
                  <p>This is a demo - no real payment will be processed</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
