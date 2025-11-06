import React from "react"
import GradientBackground from "@/components/ui/background";
import UserDashboard from "@/app/ui/dashboard/dashboard";


export default function Dashboard() {
    return (
      <div className="h-[110vh] w-full flex items-center justify-center bg-[var(--background)]">
        <GradientBackground/>
        <UserDashboard/>
      </div>
    );
  }