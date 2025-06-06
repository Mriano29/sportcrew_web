"use client";

// Core
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Elements
import { DashboardNavigation } from "@/components/DashboardNavigation";
import { Chat, Home, Person, Settings } from "@mui/icons-material";
import {
  AccountSettings,
  Chats,
  HomePage,
  Profile,
} from "@/components/DashboardPages";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

/**
 * Dashboard page includes every function from the app except login and signup
 */
export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const sections = [
    {
      name: "Home",
      icon: <Home />,
      section: <HomePage />,
    },
    {
      name: "Chats",
      icon: <Chat />,
      section: <Chats />,
    },
    {
      name: "My profile",
      icon: <Person />,
      section: <Profile />,
    },
    {
      name: "Settings",
      icon: <Settings />,
      section: <AccountSettings />,
    },
  ];
  /**
   * This checks if the user is logged, if the user is not logged it pushes it to the sign in menu
   */
  useEffect(() => {
    const session = localStorage.getItem("supabase_session");
    if (!session) {
      router.push("/");
    } else {
      setLoading(false);
    }
  }, [router]);

  /**
   * If loading shows the loading icon
   */
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <main className="h-full w-full flex flex-row">
      <div className="absolute top-4 right-4 hidden md:block">
        <ThemeSwitcher />
      </div>
      <DashboardNavigation sections={sections} />
    </main>
  );
}
