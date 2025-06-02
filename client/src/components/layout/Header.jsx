import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  Search,
  ShoppingCart,
  User,
  LogOut,
  Settings,
  Heart,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Header({ onMenuClick }) {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  const getInitials = (firstName, lastName) => {
    return (
      `${(firstName && firstName[0]) || ""}${(lastName && lastName[0]) || ""}`.toUpperCase() ||
      "U"
    );
  };
  return (
    <header className="glass-effect border-b border-border sticky top-0 z-40">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search artisan desserts..."
              className="pl-10 pr-4 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Cart button for customers */}
          {user?.role !== "vendor" && (
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={() => setLocation("/cart")}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>
          )}

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.profileImageUrl || ""}
                    alt={`${user?.firstName} ${user?.lastName}`}
                  />
                  <AvatarFallback className="gradient-sweet text-white text-sm">
                    {getInitials(user?.firstName, user?.lastName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                <div className="mt-1">
                  <Badge variant="outline" className="text-xs">
                    {user?.role === "vendor" ? "🍰 Vendor" : "🛍️ Customer"}
                  </Badge>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              {user?.role !== "vendor" && (
                <DropdownMenuItem onClick={() => setLocation("/favorites")}>
                  <Heart className="mr-2 h-4 w-4" />
                  Favorites
                </DropdownMenuItem>
              )}
              {user?.role === "vendor" && (
                <DropdownMenuItem
                  onClick={() => setLocation("/vendor/settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
