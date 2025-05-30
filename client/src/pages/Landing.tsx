import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import { Cookie, Moon, Sun, Heart, Star, Users } from "lucide-react";

export default function Landing() {
  const { theme, toggleTheme } = useTheme();

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      {/* Header */}
      <header className="relative z-10 glass-effect border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 gradient-sweet rounded-full flex items-center justify-center">
                <Cookie className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">SweetSpot</h1>
                <p className="text-xs text-muted-foreground">Artisan Dessert Marketplace</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-9 h-9 rounded-full"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              
              <Button onClick={handleLogin} className="gradient-sweet text-white">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Artisan
                  <span className="block gradient-sweet bg-clip-text text-transparent">
                    Desserts
                  </span>
                  Made with Love
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Discover handcrafted desserts from local artisans. From delicate macarons to rich chocolate truffles, 
                  every bite tells a story of passion and craftsmanship.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="gradient-sweet text-white"
                  onClick={handleLogin}
                >
                  Start Shopping
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={handleLogin}
                >
                  Become a Vendor
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Artisan Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">150+</div>
                  <div className="text-sm text-muted-foreground">Local Vendors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">25k+</div>
                  <div className="text-sm text-muted-foreground">Happy Customers</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              {/* Hero image placeholder */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <div className="w-full h-96 gradient-warm flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="text-8xl">🧁</div>
                    <p className="text-white font-medium">Beautiful Artisan Desserts</p>
                  </div>
                </div>
                
                {/* Floating cards */}
                <div className="absolute -top-4 -left-4 bg-card rounded-2xl p-4 shadow-xl border">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-sm font-medium text-foreground">Fresh Daily</span>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -right-4 bg-card rounded-2xl p-4 shadow-xl border">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary flex items-center justify-center">
                      4.9 <Star className="w-4 h-4 ml-1 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="text-sm text-muted-foreground">Top Rated</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold text-foreground">Why Choose SweetSpot?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the finest artisan desserts with convenience and quality guaranteed.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 gradient-sweet rounded-2xl flex items-center justify-center mx-auto">
                  <Cookie className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Artisan Quality</h3>
                <p className="text-muted-foreground">
                  Every dessert is handcrafted by skilled artisans using premium ingredients and traditional techniques.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 gradient-mint rounded-2xl flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Made with Love</h3>
                <p className="text-muted-foreground">
                  Each treat is created with passion and care, bringing joy and sweetness to every occasion.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 gradient-warm rounded-2xl flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Local Community</h3>
                <p className="text-muted-foreground">
                  Support local artisans and discover unique flavors that reflect the creativity of your community.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-foreground">
              Ready to Indulge in Sweet Perfection?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of dessert lovers who trust SweetSpot for their sweetest moments.
            </p>
            <Button 
              size="lg" 
              className="gradient-sweet text-white"
              onClick={handleLogin}
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-sweet rounded-full flex items-center justify-center">
                <Cookie className="w-5 h-5 text-white" />
              </div>
              <span className="text-foreground font-semibold">SweetSpot</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 SweetSpot. Bringing artisan desserts to your doorstep.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
