import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocation } from "wouter";
import {
  Cookie,
  Moon,
  Sun,
  Heart,
  Star,
  Users,
  ChefHat,
  Award,
  Truck,
  ShoppingBag,
} from "lucide-react";
export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();
  // Navigation handlers
  const handleSignIn = () => setLocation("/login");
  const handleGetStarted = () => setLocation("/signup");
  const handleStartShopping = () => setLocation("/customer/home");
  const handleBecomeVendor = () => setLocation("/vendor/signup");
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900 dark:to-rose-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-pink-200/30 to-purple-200/30 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-purple-200/30 to-blue-200/30 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-rose-200/20 to-pink-200/20 blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-sm border-b border-white/20 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 gradient-sweet rounded-2xl flex items-center justify-center shadow-lg">
                  <Cookie className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  SweetSpot
                </h1>
                <p className="text-sm text-muted-foreground font-medium">
                  Artisan Dessert Marketplace
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full hover:bg-white/20 dark:hover:bg-gray-800/50"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleSignIn}
                className="border-purple-200 hover:border-purple-300 dark:border-purple-700 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
              >
                Sign In
              </Button>

              <Button
                onClick={handleGetStarted}
                className="gradient-sweet text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div className="space-y-8">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 border border-pink-200/50 dark:border-pink-800/50">
                  <ChefHat className="w-4 h-4 mr-2 text-pink-600 dark:text-pink-400" />
                  <span className="text-sm font-medium text-pink-700 dark:text-pink-300">
                    Handcrafted Excellence
                  </span>
                </div>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="text-foreground">Artisan</span>
                  <br />
                  <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent animate-pulse">
                    Desserts
                  </span>
                  <br />
                  <span className="text-foreground">Made with</span>
                  <br />
                  <span className="bg-gradient-to-r from-rose-400 to-pink-600 bg-clip-text text-transparent">
                    Love
                  </span>
                </h1>

                <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                  Discover extraordinary handcrafted desserts from passionate
                  local artisans. From delicate French macarons to rich Belgian
                  chocolate truffles, every creation tells a story of dedication
                  and artistry.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="gradient-sweet text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6"
                  onClick={() => setLocation("/signup")}
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Start Shopping
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-purple-200 hover:border-purple-300 dark:border-purple-700 dark:hover:border-purple-600 text-lg px-8 py-6 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300"
                  onClick={() => setLocation("/signup")}
                >
                  <Award className="w-5 h-5 mr-2" />
                  Become a Vendor
                </Button>
              </div>

              {/* Enhanced Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center group">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                    500+
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Artisan Products
                  </div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                    150+
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Local Vendors
                  </div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                    25k+
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Happy Customers
                  </div>
                </div>
              </div>
            </div>

            <div className="relative lg:ml-8">
              {/* Enhanced Hero Visual */}
              <div className="relative">
                {/* Main hero image */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 p-1">
                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-purple-900 rounded-3xl p-12 h-[500px] flex flex-col items-center justify-center text-center space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-6xl">
                      <div className="animate-bounce delay-0">🧁</div>
                      <div className="animate-bounce delay-100">🍰</div>
                      <div className="animate-bounce delay-200">🍪</div>
                      <div className="animate-bounce delay-300">🍫</div>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">
                      Premium Artisan Collection
                    </h3>
                    <p className="text-muted-foreground">
                      Handcrafted daily with love
                    </p>
                  </div>
                </div>

                {/* Enhanced Floating Cards */}
                <div className="absolute -top-6 -left-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                    <div className="w-4 h-4 bg-green-400 rounded-full absolute"></div>
                    <span className="text-sm font-semibold text-foreground">
                      Fresh Daily
                    </span>
                  </div>
                </div>

                <div className="absolute -bottom-6 -right-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-5 shadow-2xl border border-white/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-500 flex items-center justify-center mb-1">
                      4.9{" "}
                      <Star className="w-5 h-5 ml-1 fill-amber-400 text-amber-400" />
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      Top Rated
                    </div>
                  </div>
                </div>

                <div className="absolute top-1/2 -right-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-white/20 transform -translate-y-1/2">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-semibold text-foreground">
                      Free Delivery
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-pink-50/30 to-purple-50/50 dark:from-gray-900/50 dark:via-purple-900/30 dark:to-gray-900/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200/50 dark:border-purple-800/50">
              <Star className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Why Choose SweetSpot
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              Experience the{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Difference
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover what makes our artisan marketplace the preferred choice
              for dessert lovers and talented creators alike.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <Card className="group border-0 shadow-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <CardContent className="p-10 text-center space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 gradient-sweet rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Cookie className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Award className="w-3 h-3 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground group-hover:text-purple-600 transition-colors duration-300">
                  Artisan Quality
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every dessert is handcrafted by skilled artisans using the
                  finest premium ingredients and time-honored traditional
                  techniques passed down through generations.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-0 shadow-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <CardContent className="p-10 text-center space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 gradient-mint rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-bold text-foreground group-hover:text-pink-600 transition-colors duration-300">
                  Made with Love
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Each treat is created with genuine passion and meticulous
                  care, bringing authentic joy and sweetness to every special
                  occasion and everyday moment.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-0 shadow-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <CardContent className="p-10 text-center space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 gradient-warm rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                    <Heart className="w-3 h-3 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground group-hover:text-orange-600 transition-colors duration-300">
                  Local Community
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Support passionate local artisans and discover extraordinary
                  unique flavors that beautifully reflect the creativity and
                  heritage of your community.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-rose-600/10"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/20">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-rose-100 to-orange-100 dark:from-rose-900/30 dark:to-orange-900/30 border border-rose-200/50 dark:border-rose-800/50">
                <Cookie className="w-4 h-4 mr-2 text-rose-600 dark:text-rose-400" />
                <span className="text-sm font-medium text-rose-700 dark:text-rose-300">
                  Ready to Begin
                </span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
                Ready to Indulge in
                <br />
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                  Sweet Perfection?
                </span>
              </h2>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Join thousands of dessert enthusiasts who trust SweetSpot to
                deliver extraordinary moments of sweetness and joy to their
                everyday lives.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="gradient-sweet text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg px-10 py-6"
                onClick={() => setLocation("/signup")}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Get Started Today
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-purple-200 hover:border-purple-300 dark:border-purple-700 dark:hover:border-purple-600 text-lg px-10 py-6 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300"
                onClick={handleSignIn}
              >
                Learn More
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-8 pt-6">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Free Delivery</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Quality Guaranteed</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Artisan Made</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/20 dark:border-gray-800/50 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 gradient-sweet rounded-2xl flex items-center justify-center shadow-lg">
                  <Cookie className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  SweetSpot
                </h3>
                <p className="text-sm text-muted-foreground">
                  Artisan Dessert Marketplace
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground leading-relaxed">
                Connecting passionate artisans with dessert lovers everywhere.
                Experience the finest handcrafted treats made with love and
                tradition.
              </p>
            </div>

            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground mb-2">
                © 2024 SweetSpot
              </p>
              <p className="text-xs text-muted-foreground">
                Bringing artisan desserts to your doorstep with love
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
