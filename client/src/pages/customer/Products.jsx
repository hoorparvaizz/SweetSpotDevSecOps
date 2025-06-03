import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/ui/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/SkeletonLoader";
import {
  Search,
  Filter,
  Grid,
  List,
  Cake,
  Coffee,
  Cookie,
  IceCream,
  Wheat,
  Leaf,
} from "lucide-react";

export default function Products() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split("?")[1] || "");
  const [searchQuery, setSearchQuery] = useState(urlParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    urlParams.get("category") || "all",
  );
  const [selectedDietary, setSelectedDietary] = useState(
    urlParams.get("dietary") || "all",
  );
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });
  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("http://localhost:3001/api/products?isActive=true", {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
  });
  const dietaryOptions = [
    { value: "vegan", label: "Vegan", icon: Leaf },
    { value: "gluten-free", label: "Gluten-Free", icon: Wheat },
    { value: "sugar-free", label: "Sugar-Free", icon: null },
    { value: "keto", label: "Keto", icon: null },
  ];
  const categoryIcons = {
    cakes: Cake,
    pastries: Coffee,
    cookies: Cookie,
    "ice-cream": IceCream,
  };
  const handleSearch = (e) => {
    e.preventDefault();
    // Search now works automatically through filteredAndSortedProducts
    // No need to manually trigger refetch since we're using client-side filtering
  };
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedDietary("all");
    setSortBy("newest");
  };
  const hasActiveFilters = searchQuery || selectedCategory !== "all" || selectedDietary !== "all";
  // Demo products for empty state
  const demoProducts = [
    {
      id: "demo1",
      name: "Classic Chocolate Cake",
      description: "Rich, moist chocolate cake with creamy ganache.",
      price: 24.99,
      imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
      stock: 12,
      dietary: ["vegetarian"],
    },
    {
      id: "demo2",
      name: "Vegan Lemon Tart",
      description: "Tangy lemon tart with a crisp vegan crust.",
      price: 19.99,
      imageUrl: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
      stock: 8,
      dietary: ["vegan"],
    },
    {
      id: "demo3",
      name: "Gluten-Free Brownies",
      description: "Fudgy brownies made with almond flour.",
      price: 14.99,
      imageUrl: "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80",
      stock: 15,
      dietary: ["gluten-free"],
    },
    {
      id: "demo4",
      name: "Strawberry Shortcake",
      description: "Fluffy shortcake with fresh strawberries and cream.",
      price: 17.99,
      imageUrl: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80",
      stock: 10,
      dietary: [],
    },
    {
      id: "demo5",
      name: "Salted Caramel Macarons",
      description: "Delicate French macarons with salted caramel filling.",
      price: 11.99,
      imageUrl: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
      stock: 20,
      dietary: ["vegetarian"],
    },
  ];
  // Client-side filtering and sorting
  const filteredAndSortedProducts = products
    .filter((product) => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === "all" || 
        (product.categoryId?._id === selectedCategory || product.categoryId === selectedCategory);
      
      const matchesDietary = 
        selectedDietary === "all" || 
        (product.dietary && product.dietary.includes(selectedDietary));

      return matchesSearch && matchesCategory && matchesDietary;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return parseFloat(a.price) - parseFloat(b.price);
        case "price-high":
          return parseFloat(b.price) - parseFloat(a.price);
        case "name":
          return a.name.localeCompare(b.name);
        case "newest":
        default:
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
      }
    });
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Artisan Desserts</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover handcrafted desserts from talented local artisans
        </p>
      </div>

      {/* Search and Filters */}
      <div className="glass-effect rounded-2xl p-6 border border-border">
        <div className="space-y-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search desserts..."
              className="pl-10 pr-4 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-48 rounded-full">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem
                    key={category._id || category.id}
                    value={category._id || category.id}
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDietary} onValueChange={setSelectedDietary}>
              <SelectTrigger className="w-48 rounded-full">
                <SelectValue placeholder="Dietary Options" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Options</SelectItem>
                {dietaryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 rounded-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters and View Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="rounded-full"
                >
                  Clear Filters
                </Button>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="rounded-full">
                  Search: {searchQuery}
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="rounded-full">
                  Category: {categories.find((cat) => (cat._id || cat.id) === selectedCategory)?.name || selectedCategory}
                </Badge>
              )}
              {selectedDietary !== "all" && (
                <Badge variant="secondary" className="rounded-full">
                  Dietary: {selectedDietary}
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-full"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-full"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {isLoading ? "Loading..." : `${filteredAndSortedProducts.length} products found`}
          </p>
        </div>

        {/* Product Grid/List */}
        {isLoading ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">
              Failed to load products. Please try again.
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="text-6xl">🔍</div>
            <h3 className="text-xl font-semibold text-foreground">
              No products found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or clearing filters
            </p>
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                className="gradient-sweet text-white"
              >
                Clear All Filters
              </Button>
            )}
            {/* Show demo products if no products from API */}
            <div className="mt-8">
              <h4 className="text-lg font-bold mb-4 text-foreground">Featured Treats</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {demoProducts.map((product) => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="text-6xl">🔍</div>
            <h3 className="text-xl font-semibold text-foreground">
              No products found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or clearing filters
            </p>
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                className="gradient-sweet text-white"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
