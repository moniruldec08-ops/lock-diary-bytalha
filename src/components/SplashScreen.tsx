import { useEffect, useState } from "react";
import logo from "@/assets/logo.png";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[100] gradient-bg-ocean flex flex-col items-center justify-center transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="animate-bounce-in">
        <img 
          src={logo} 
          alt="Lock Diary" 
          className="w-48 h-48 drop-shadow-2xl animate-pulse-glow"
        />
      </div>
      <h1 className="text-4xl font-bold text-white mt-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        Lock Diary
      </h1>
      <p className="text-white/80 mt-2 animate-fade-in" style={{ animationDelay: '0.8s' }}>
        Your secure digital journal
      </p>
    </div>
  );
}
