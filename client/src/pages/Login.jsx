import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRightCircle, User, Store } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Make API call to login
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({
          email,
          password,
          role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save user data to local storage
      const userData = {
        id: data.user._id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        role: data.user.role,
        token: data.token
      };
      
      localStorage.setItem("sweetspot_user", JSON.stringify(userData));
      
      // Redirect based on role
      if (data.user.role === 'vendor') {
        window.location.href = "/vendor/dashboard";
      } else {
        window.location.href = "/customer/home";
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to log in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/10 z-50">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-sm relative animate-fade-in">
        <button type="button" onClick={() => setLocation("/")} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl">&times;</button>
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-br from-pink-400 to-purple-400 rounded-full p-4 mb-2">
            <ArrowRightCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-1 text-foreground text-center">Welcome Back!</h2>
          <p className="text-muted-foreground text-center mb-2">Sign in to your sweet account</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-pink-600">Sign in as</label>
          <div className="flex gap-2 mb-2">
            <button type="button" onClick={() => setRole("customer")} className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 p-2 font-medium transition ${role === "customer" ? "border-pink-400 bg-pink-50 text-pink-700" : "border-gray-200 bg-white text-gray-500"}`}>
              <User className="h-5 w-5" /> Customer
            </button>
            <button type="button" onClick={() => setRole("vendor")} className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 p-2 font-medium transition ${role === "vendor" ? "border-purple-400 bg-purple-50 text-purple-700" : "border-gray-200 bg-white text-gray-500"}`}>
              <Store className="h-5 w-5" /> Vendor
            </button>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-pink-600">Email</label>
          <input
            className="block w-full rounded-lg border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 p-2 outline-none bg-white dark:bg-gray-800 transition"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1 text-pink-600">Password</label>
          <input
            className="block w-full rounded-lg border-2 border-purple-100 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 p-2 outline-none bg-white dark:bg-gray-800 transition"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold shadow-md hover:from-pink-500 hover:to-purple-500 transition-all">Sign In</Button>
        <div className="text-center mt-4 text-sm text-muted-foreground">
          Don't have an account?{' '}
          <span className="text-pink-600 font-medium cursor-pointer hover:underline" onClick={() => setLocation("/signup")}>Sign up</span>
        </div>
      </form>
    </div>
  );
} 