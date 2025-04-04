"use client";
//Core
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

//Elements
import { FormButton, FormInput } from "../ui";
import { Bounce, toast } from "react-toastify";
import { OrDiv } from "../OrDiv";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SignUpFormProps {}

export const SignUpForm: React.FC<SignUpFormProps> = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
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
      if (password !== passwordRepeat) {
        toast.error("Passwords do not match.", {
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
        toast.success("Confirm your email to log in!", {
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
        router.push("/");
      }
    }
  };

  function handleReset(): void {
    setEmail("");
    setPassword("");
    setPasswordRepeat("");
    setError("");
  }

  return (
    <div className="bg-card border-2 border-border rounded-3xl p-10">
      <form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
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
        <FormInput
          title="Repeat your password"
          type="password"
          placeholder="••••••••"
          value={passwordRepeat}
          onChange={(e) => setPasswordRepeat(e.target.value)}
        />
        <div className="flex flex-row gap-5">
          <FormButton title="Sign up" type="submit" />
          <FormButton
            title="Clear"
            type="reset"
            secondVariant
            onClick={handleReset}
          />
        </div>
      </form>
      <OrDiv />
      <FormButton
        title="Log in to your account"
        type="button"
        thirdVariant
        onClick={() => router.push("/")}
      />
    </div>
  );
};
