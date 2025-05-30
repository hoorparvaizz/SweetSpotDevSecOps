import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/ui/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/SkeletonLoader";
import { Search, Filter, Grid, List, Cake, Coffee, Cookie, IceCream, Wheat, Leaf } from "lucide-react";
import type { Product } from "@/types";

export default function Products() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split("?")[1] || "");
  
  const [searchQuery, setSearchQuery] = useState(urlParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(urlParams.get("category") || "");
  const [selectedDietary, setSelectedDietary] = useState(urlParams.get("dietary") || "");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ["/api/products", { 
      search: searchQuery,
      category: selectedCategory,
      dietary: selectedDietary,
      isActive: true 
    }],
  });

  const dietaryOptions = [
    { value: "vegan", label: "Vegan", icon: Leaf },
    { value: "gluten-free", label: "Gluten-Free", icon: Wheat },
    { value: "sugar-free", label: "Sugar-Free", icon: null },
    { value: "keto", label: "Keto", icon: null },
  ];

  const categoryIcons = {
    "cakes": Cake,
    "pastries": Coffee,
    "cookies": Cookie,
    "ice-cream": IceCream,
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will automatically refetch due to the dependency
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedDietary("");
    setSortBy("newest");
  };

  const sortedProducts = [...products].sort((a: Product, b: Product) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-high":
        return parseFloat(b.price) - parseFloat(a.price);
      case "name":
        return a.name.localeCompare(b.name);
      case "newest":
      default:
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
  });

  const hasActiveFilters = searchQuery || selectedCategory || selectedDietary;

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
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 rounded-full">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.name.toLowerCase()}>
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
                <SelectItem value="">All Options</SelectItem>
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
              {selectedCategory && (
                <Badge variant="secondary" className="rounded-full">
                  Category: {selectedCategory}
                </Badge>
              )}
              {selectedDietary && (
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
            {isLoading ? "Loading..." : `${products.length} products found`}
          </p>
        </div>

        {/* Product Grid/List */}
        {isLoading ? (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">Failed to load products. Please try again.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="text-6xl">🔍</div>
            <h3 className="text-xl font-semibold text-foreground">No products found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or clearing filters
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} className="gradient-sweet text-white">
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {sortedProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
