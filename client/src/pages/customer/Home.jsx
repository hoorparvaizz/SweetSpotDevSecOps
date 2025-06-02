import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/ui/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/SkeletonLoader";
import { useState } from "react";
import { useLocation } from "wouter";
import { Cake, Coffee, Cookie, IceCream, Wheat, Leaf } from "lucide-react";
export default function CustomerHome() {
  const [, setLocation] = useLocation();
  const [activeFilter, setActiveFilter] = useState("all");
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products", { isActive: true }],
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });
  const filters = [
    { id: "all", label: "All Categories", icon: null },
    { id: "cakes", label: "Cakes", icon: Cake },
    { id: "pastries", label: "Pastries", icon: Coffee },
    { id: "cookies", label: "Cookies", icon: Cookie },
    { id: "ice-cream", label: "Ice Cream", icon: IceCream },
    { id: "vegan", label: "Vegan", icon: Leaf },
    { id: "gluten-free", label: "Gluten-Free", icon: Wheat },
  ];
  const handleFilterClick = (filterId) => {
    setActiveFilter(filterId);
    if (filterId === "all") {
      // No additional filters
    } else if (filterId === "vegan" || filterId === "gluten-free") {
      setLocation(`/products?dietary=${filterId}`);
    } else {
      setLocation(`/products?category=${filterId}`);
    }
  };
  const featuredProducts = products.slice(0, 8);
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden gradient-sweet p-8 lg:p-16 text-white">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold">
                Artisan
                <span className="block text-white/90">Desserts</span>
                Made with Love
              </h1>
              <p className="text-lg text-white/80">
                Discover extraordinary handcrafted desserts from passionate 
                local artisans. From delicate French macarons to rich Belgian 
                chocolate truffles, every creation tells a story of dedication 
                and artistry.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => setLocation("/products")}
              >
                Explore Desserts
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm text-white/70">Artisan Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">150+</div>
                <div className="text-sm text-white/70">Local Vendors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">25k+</div>
                <div className="text-sm text-white/70">Happy Customers</div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <div className="w-full h-96 gradient-warm flex items-center justify-center relative">
                <div className="text-center space-y-4 z-20 relative">
                  <p className="text-white font-bold text-2xl">
                    Premium Artisan Collection
                  </p>
                  <p className="text-white/90 text-base">
                    Handcrafted daily with love & passion
                  </p>
                </div>
                
                {/* Scattered Dessert Emojis - Lower z-index so they stay behind text and adjusted positions */}
                <div className="text-6xl animate-bounce absolute top-20 left-20 z-10" style={{ animationDelay: "0.8s" }}>🍰</div>
                <div className="text-6xl animate-bounce absolute top-32 right-16 z-10" style={{ animationDelay: "1.2s" }}>🍫</div>
                <div className="text-6xl animate-bounce absolute bottom-32 left-16 z-10" style={{ animationDelay: "1.6s" }}>🍪</div>
                <div className="text-5xl animate-bounce absolute top-12 right-32 z-10" style={{ animationDelay: "2s" }}>🍩</div>
                <div className="text-5xl animate-bounce absolute bottom-20 right-24 z-10" style={{ animationDelay: "2.4s" }}>🥧</div>
                <div className="text-5xl animate-bounce absolute top-1/3 left-8 z-10" style={{ animationDelay: "2.8s" }}>🍭</div>
                <div className="text-4xl animate-bounce absolute bottom-16 left-32 z-10" style={{ animationDelay: "3.2s" }}>🧇</div>
                <div className="text-4xl animate-bounce absolute top-20 right-12 z-10" style={{ animationDelay: "3.6s" }}>🍮</div>
              </div>

              {/* Floating Cards - Positioned to be fully visible */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur rounded-2xl p-3 shadow-xl animate-bounce z-30" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-800">
                    Fresh Daily
                  </span>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur rounded-2xl p-3 shadow-xl animate-bounce z-30" style={{ animationDelay: "0.7s" }}>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">4.9★</div>
                  <div className="text-sm text-gray-600">Top Rated</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section>
        <div className="flex flex-wrap gap-3 justify-center">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            return (
              <Button
                key={filter.id}
                variant={isActive ? "default" : "outline"}
                className={`rounded-full ${
                  isActive
                    ? "gradient-sweet text-white border-0"
                    : "hover:bg-muted"
                }`}
                onClick={() => handleFilterClick(filter.id)}
              >
                {Icon && <Icon className="w-4 h-4 mr-2" />}
                {filter.label}
              </Button>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              Featured Artisan Desserts
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Handpicked favorites from our talented artisan vendors
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Button
              size="lg"
              variant="outline"
              onClick={() => setLocation("/products")}
            >
              View All Products
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
