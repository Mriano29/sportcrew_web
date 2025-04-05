"use client";
//Core
import { useRouter } from "next/navigation";

//Elements
import { DashboardNavigation } from "@/components/DashboardNavigation";
import { Chat, Home, Person, Settings } from "@mui/icons-material";
import {
  AccountSettings,
  Chats,
  HomePage,
  Profile,
} from "@/components/DashboardPages";

export default function Dashboard() {
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

  return (
    <main className="h-full w-full flex flex-row">
      <DashboardNavigation sections={sections} />
    </main>
  );
}
