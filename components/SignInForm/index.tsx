"use client";
//Core
import { useState } from "react";
import { useRouter } from "next/navigation";

//Elements
import { FormButton, FormInput, OrDiv } from "../ui";
import { Bounce, toast } from "react-toastify";
import { supabase } from "@/lib/client";

interface SignInFormProps {}

export const SignInForm: React.FC<SignInFormProps> = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const setCookie = (name: string, value: string, days: number) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; secure; SameSite=Strict`;
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message, {
        position: "top-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
    } else {
      const token = data?.session?.access_token;
      if (token) {
        setCookie("sb_token", token, 7);
      }
      router.push("/dashboard");
    }
  };

  return (
    <div className="bg-card border-2 border-border rounded-3xl p-10">
      <div className="mb-6 flex flex-col justify-center items-center">
        <img
          className="object-contain"
          src="/images/sportcrewlogo.png"
          width={100}
          height={100}
          alt="SportCrew Logo"
        />
        <h1 className="text-2xl font-semibold mt-2 text-center">
          Welcome to Sportcrew
        </h1>
      </div>
      <form className="w-full max-w-sm space-y-4" onSubmit={handleLogin}>
        <FormInput
          title="Email"
          type="email"
          placeholder="user@sportcrew.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormInput
          title="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <FormButton title="Sign in" type="submit" />
      </form>
      <OrDiv />
      <FormButton
        title="Create an account"
        type="button"
        thirdVariant
        onClick={() => router.push("/signup")}
      />
    </div>
  );
};
