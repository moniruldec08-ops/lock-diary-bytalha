import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { isLockSetup } from "@/lib/db";
import LockSetup from "./pages/LockSetup";
import Unlock from "./pages/Unlock";
import Dashboard from "./pages/Dashboard";
import EntryEditor from "./pages/EntryEditor";
import EntryDetail from "./pages/EntryDetail";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLock, setHasLock] = useState(false);

  useEffect(() => {
    checkLockStatus();
  }, []);

  const checkLockStatus = async () => {
    const lockExists = await isLockSetup();
    setHasLock(lockExists);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg-2 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-foreground">Loading My Diary Pro...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                hasLock ? <Navigate to="/unlock" replace /> : <Navigate to="/setup" replace />
              }
            />
            <Route path="/setup" element={<LockSetup />} />
            <Route path="/unlock" element={<Unlock />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/entry/:id" element={<EntryEditor />} />
            <Route path="/detail/:id" element={<EntryDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
