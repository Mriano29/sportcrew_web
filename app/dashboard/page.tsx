"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { MainContainer } from "@/components/MainContainer";
import { Sidebar } from "@/components/DashboardSidebar";

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "sb_token=; Max-Age=0; path=/";
    router.push("/");
  };

  return (
    <main>
      <div></div>
      <div></div>
    </main>
  );
}
