import { MainContainer } from "@/components/MainContainer";
import { SignInForm } from "@/components/SignInForm";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import Image from "next/image";


export default async function Home() {
  return (
    <MainContainer>
      <div className="bg-white dark:bg-gray-900 grid w-full h-full grid-cols-1 md:grid-cols-2 shadow-lg">
        <div className="bg-white dark:bg-gray-800 text-black dark:text-white flex items-center justify-center flex-col p-10 relative">
          <div className="absolute top-4 left-4">
            <ThemeSwitcher />
          </div>
          <SignInForm />
        </div>
        <div className="relative hidden md:block w-full h-full">
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
