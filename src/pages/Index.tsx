import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isLockSetup } from "@/lib/db";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkAndRedirect();
  }, []);

  const checkAndRedirect = async () => {
    const hasLock = await isLockSetup();
    if (hasLock) {
      navigate("/unlock");
    } else {
      navigate("/setup");
    }
  };

  return (
    <div className="min-h-screen gradient-bg-2 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-semibold text-foreground">Loading My Diary Pro...</p>
      </div>
    </div>
  );
};

export default Index;
