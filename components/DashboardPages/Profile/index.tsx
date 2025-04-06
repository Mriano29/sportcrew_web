//Core
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

//Elements
import Image from "next/image";
import { LoadingScreen, MainContainer } from "@/components/ui";

// Inicializa Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const Profile = () => {
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error fetching session:", sessionError.message);
        return;
      }

      const user = sessionData?.session?.user;

      if (user) {
        const userId = user.id;

        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching user data:", error.message);
        } else {
          setUserData(data);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <MainContainer>
      <div className="flex flex-col p-10 h-full">
        <div>
          <Image
            className="bg-white"
            src="/images/sportcrewlogo.png"
            width={250}
            height={250}
            alt="SportCrew Logo"
          />
        </div>
        <div className="bg-white">
erwt
        </div>
      </div>
      <div>posts</div>
    </MainContainer>
  );
};
