"use client";

// Elements
import { MainContainer } from "@/components/ui";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { SignInForm } from "@/components/SignInForm";

export default function Home() {
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
          <img
            className="object-cover w-full h-full"
            src="/images/sideimage.jpg"
            alt="Login side image"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    </MainContainer>
  );
}
