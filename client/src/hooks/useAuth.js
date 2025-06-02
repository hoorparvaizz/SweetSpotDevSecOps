import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching user from localStorage (for demo)
    const stored = localStorage.getItem("sweetspot_user");
    if (stored) {
      try {
      setUser(JSON.parse(stored));
      } catch (e) {
        setUser(null);
        localStorage.removeItem("sweetspot_user");
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  // Add logout function for demo
  const logout = () => {
    localStorage.removeItem("sweetspot_user");
    window.location.href = "/login";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}
