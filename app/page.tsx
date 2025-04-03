"use client";
// Elements
import { MainContainer } from "@/components/MainContainer";
import { SignInForm } from "@/components/SignInForm";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const getCookie = (name: string) => {
  const matches = document.cookie.match(
    new RegExp(
      "(?:^|; )" +
      name.replace(/([.$?*|{}()[]\/+^])/g, "\\$1") +
      "=([^;]*)"
    )
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
};

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getCookie("sb_token");

    if (token) {
      supabase.auth.setSession({
        access_token: token,
        refresh_token: "",
      }).then(() => {
        router.push("/dashboard");
      }).catch((error) => {
        // Si no se puede autenticar, redirige al login
        console.error("Error al autenticar:", error);
      }).finally(() => {
        setLoading(false); 
      });
    } else {
      setLoading(false); 
    }
  }, [router]);

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <MainContainer>
      <div className="bg-background grid w-full h-full grid-cols-1 lg:grid-cols-2 shadow-lg">
        <div className="flex items-center justify-center flex-col p-10 relative">
          <div className="absolute top-4 left-4">
            <ThemeSwitcher />
          </div>
          <SignInForm />
        </div>
        <div className="relative hidden lg:block w-full h-full">
          <Image
            className="object-cover w-full h-full"
            fill
            src="/images/sideimage.jpg"
            alt="Login side image"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    </MainContainer>
  );
}
