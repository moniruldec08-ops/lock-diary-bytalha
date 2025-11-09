import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { isLockSetup, getSetting } from "@/lib/db";
import SplashScreen from "./components/SplashScreen";
import StorageModeSelection from "./pages/StorageModeSelection";
import CloudAuth from "./pages/CloudAuth";
import ResetPassword from "./pages/ResetPassword";
import LockSetup from "./pages/LockSetup";
import Unlock from "./pages/Unlock";
import Dashboard from "./pages/Dashboard";
import EntryEditor from "./pages/EntryEditor";
import EntryDetail from "./pages/EntryDetail";
import Settings from "./pages/Settings";
import Achievements from "./pages/Achievements";
import CalendarView from "./pages/CalendarView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [hasStorageMode, setHasStorageMode] = useState(false);
  const [hasLock, setHasLock] = useState(false);

  useEffect(() => {
    checkAppStatus();
  }, []);

  const checkAppStatus = async () => {
    const storageMode = await getSetting('storageMode');
    const lockExists = await isLockSetup();
    setHasStorageMode(!!storageMode);
    setHasLock(lockExists);
    setIsLoading(false);
  };

  if (showSplash || isLoading) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                !hasStorageMode ? (
                  <Navigate to="/storage-mode" replace />
                ) : hasLock ? (
                  <Navigate to="/unlock" replace />
                ) : (
                  <Navigate to="/setup" replace />
                )
              }
            />
            <Route path="/storage-mode" element={<StorageModeSelection />} />
            <Route path="/cloud-auth" element={<CloudAuth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/setup" element={<LockSetup />} />
            <Route path="/unlock" element={<Unlock />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/entry/:id" element={<EntryEditor />} />
            <Route path="/view/:id" element={<EntryDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
