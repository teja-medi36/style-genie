import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./hooks/useAuth";
import SplashScreen from "./components/SplashScreen";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Wardrobe from "./pages/Wardrobe";
import GetStyled from "./pages/GetStyled";
import Profile from "./pages/Profile";
import SearchOutfits from "./pages/SearchOutfits";
import SavedLooks from "./pages/SavedLooks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AnimatePresence mode="wait">
            {showSplash ? (
              <SplashScreen key="splash" onComplete={handleSplashComplete} />
            ) : (
              <BrowserRouter key="app">
                <Routes>
                  <Route path="/" element={<Navigate to="/auth" replace />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/wardrobe" element={<Wardrobe />} />
                  <Route path="/get-styled" element={<GetStyled />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/search" element={<SearchOutfits />} />
                  <Route path="/saved" element={<SavedLooks />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            )}
          </AnimatePresence>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
