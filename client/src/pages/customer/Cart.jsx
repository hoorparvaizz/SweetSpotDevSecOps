import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { getFullImageUrl } from "@/lib/utils";

export default function Cart() {
  const [, setLocation] = useLocation();
  const {
    cartItems,
    cartTotal,
    isLoading,
    updateCartItem,
    removeFromCart,
    clearCart,
  } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const deliveryFee = 3.99;
  const taxRate = 0.08;
  const subtotal = cartTotal;
  const tax = subtotal * taxRate;
  const promoDiscount = promoApplied ? subtotal * 0.1 : 0; // 10% discount
  const total = subtotal + deliveryFee + tax - promoDiscount;
  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart.mutate(item._id);
    } else if (item.product && newQuantity <= item.product.stock) {
      updateCartItem.mutate({ id: item._id, quantity: newQuantity });
    }
  };
  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === "sweet10") {
      setPromoApplied(true);
    }
  };
  const handleProceedToCheckout = () => {
    setLocation("/checkout");
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (cartItems.length === 0) {
    return (
      <div className="text-center py-16 space-y-6">
        <div className="w-24 h-24 mx-auto gradient-sweet rounded-full flex items-center justify-center">
          <ShoppingBag className="w-12 h-12 text-white" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            Your cart is empty
          </h2>
          <p className="text-muted-foreground">
            Looks like you haven't added any delicious desserts yet!
          </p>
        </div>
        <Button
          size="lg"
          className="gradient-sweet text-white"
          onClick={() => setLocation("/products")}
        >
          Start Shopping
        </Button>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in
            your cart
          </p>
        </div>
        {cartItems.length > 0 && (
          <Button
            variant="outline"
            onClick={() => clearCart.mutate()}
            disabled={clearCart.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item._id} className="border-0 shadow-lg bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    {item.product && item.product.imageUrl ? (
                      <img
                        src={getFullImageUrl(item.product.imageUrl)}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full gradient-sweet flex items-center justify-center">
                        <span className="text-white text-2xl">🧁</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {item.product ? item.product.name : "Unknown Product"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.product ? item.product.description : "No description available."}
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {item.product ? `$${parseFloat(item.product.price).toFixed(2)} each` : ""}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart.mutate(item._id)}
                        disabled={removeFromCart.isPending || !item.product}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Special Requests */}
                    {item.specialRequests && (
                      <div className="text-sm">
                        <span className="font-medium">Special requests: </span>
                        <span className="text-muted-foreground">
                          {item.specialRequests}
                        </span>
                      </div>
                    )}

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (item.quantity === 1) {
                              removeFromCart.mutate(item._id);
                            } else {
                              handleQuantityChange(item, item.quantity - 1);
                            }
                          }}
                          disabled={updateCartItem.isPending || !item.product}
                          className="w-8 h-8 rounded-full p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-medium text-lg w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          disabled={
                            !item.product || (item.product && item.quantity >= item.product.stock) || updateCartItem.isPending
                          }
                          className="w-8 h-8 rounded-full p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground ml-2">
                          {item.product ? `(${item.product.stock} available)` : ""}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {item.product ? `$${(parseFloat(item.product.price) * item.quantity).toFixed(2)}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-lg bg-card/50 sticky top-4">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-lg font-semibold text-foreground">
                Order Summary
              </h3>

              {/* Promo Code */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Promo Code</label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={promoApplied}
                  />
                  <Button
                    variant="outline"
                    onClick={handleApplyPromo}
                    disabled={promoApplied || !promoCode}
                  >
                    Apply
                  </Button>
                </div>
                {promoApplied && (
                  <p className="text-sm text-green-600">
                    ✓ SWEET10 applied - 10% off
                  </p>
                )}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount (10%)</span>
                    <span>-${promoDiscount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                size="lg"
                className="w-full gradient-sweet text-white"
                onClick={handleProceedToCheckout}
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              {/* Continue Shopping */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setLocation("/products")}
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
