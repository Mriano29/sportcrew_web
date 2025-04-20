"use client";

// Core
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

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

// Crear cliente de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

  // Verificar sesión al cargar
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/");
      } else {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

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
