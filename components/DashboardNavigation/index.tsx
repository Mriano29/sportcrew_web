"use client";
//Core
import React, { ReactNode, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

//Elements
import { MainContainer } from "../MainContainer";
import { ThemeSwitcher } from "../ThemeSwitcher";
import DashboardLogo from "../DashboardLogo";
import { Logout } from "@mui/icons-material";

//Types
interface Sections {
  name: string;
  icon: ReactNode;
  section: ReactNode;
}

interface DashboardNavigationProps {
  sections: Sections[];
}

//Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const DashboardNavigation: React.FC<DashboardNavigationProps> = ({
  sections,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "sb_token=; Max-Age=0; path=/";
    router.push("/");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      <div className="hidden lg:flex w-60 bg-accent  flex-shrink-0 flex-col">
        <DashboardLogo />
        <div className="flex-1 overflow-y-auto">
          <ul className="mt-2">
            {sections.map((section, index) => (
              <li key={section.name}>
                <button
                  className={`w-full flex items-center px-4 py-3 text-left hover:bg-card transition-colors ${
                    selectedIndex === index ? "bg-accent-foreground" : ""
                  }`}
                  onClick={() => setSelectedIndex(index)}
                >
                  <span className="mr-3">{section.icon}</span>
                  <span>{section.name}</span>
                </button>
              </li>
            ))}
            <button
              className={
                "w-full flex items-center px-4 py-3 text-left hover:bg-card transition-colors"
              }
              onClick={handleLogout}
            >
              <span className="mr-3">{<Logout />}</span>
              <span>Log out</span>
            </button>
          </ul>
        </div>
      </div>
      <MainContainer>{sections[selectedIndex].section}</MainContainer>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-accent border-t border-border flex justify-around items-center py-2 lg:hidden">
        {sections.map((section, index) => (
          <button
            key={section.name}
            className={`flex flex-col items-center text-xs ${
              selectedIndex === index ? "text-primary" : "text-foreground"
            }`}
            onClick={() => setSelectedIndex(index)}
          >
            <div className="text-xl">{section.icon}</div>
            <span>{section.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
