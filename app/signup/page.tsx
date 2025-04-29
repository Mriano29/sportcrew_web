//Elements
import { MainContainer } from "@/components/ui/MainContainer";
import { SignUpForm } from "@/components/SignUpForm";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export default async function Signup() {
  return (
    <MainContainer>
      <div className="bg-background grid w-full h-full grid-cols-1 lg:grid-cols-2 shadow-lg">
        <div className="relative hidden lg:block w-full h-full">
          <img
            className="object-cover w-full h-full"  
            src="/images/sideimage.jpg"
            alt="Login side image"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="flex items-center justify-center flex-col p-10 relative">
          <div className="absolute top-4 right-4">
            <ThemeSwitcher />
          </div>
          <SignUpForm />
        </div>
      </div>
    </MainContainer>
  );
}
