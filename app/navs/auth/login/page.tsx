import Login from "@/app/ui/login/login";
import GradientBackground from "@/components/ui/background";
import React from "react";


export default function LoginPage() {
  return (
    <div className="h-[100vh] w-full flex items-center justify-center bg-[var(--background)]">
      <GradientBackground/>
      <Login/>
    </div>
  );
}
