"use client";
//Core
import { useRouter } from "next/navigation";
import { useState } from "react";

//Elements
import { FormButton, FormInput, OrDiv } from "../ui";
import { Bounce, toast } from "react-toastify";
import { supabase } from "@/lib/client";

interface SignUpFormProps {}

export const SignUpForm: React.FC<SignUpFormProps> = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");

  /**
   * Here the written data is checked, if everything's correct
   * supabase auth is called go subscribe the user and a table
   * is created to save user's profile data
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!username.trim()) {
      toast.error("Username is required.", {
        position: "top-left",
        autoClose: 5000,
        theme: "colored",
        transition: Bounce,
      });
      return;
    }

    if (password !== passwordRepeat) {
      toast.error("Passwords do not match.", {
        position: "top-left",
        autoClose: 5000,
        theme: "colored",
        transition: Bounce,
      });
      return;
    }

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
    });

    const { user } = data;

    if (error) {
      toast.error(error.message, {
        position: "top-left",
        autoClose: 5000,
        theme: "colored",
        transition: Bounce,
      });
    } else {
      const { error: insertError } = await supabase.from("users").insert([
        {
          id: user?.id,
          user: username,
        },
      ]);

      if (insertError) {
        toast.error("Error creating user profile: " + insertError.message, {
          position: "top-left",
          autoClose: 5000,
          theme: "colored",
          transition: Bounce,
        });
        return;
      }

      toast.success("Confirm your email to log in!", {
        position: "top-left",
        autoClose: 5000,
        theme: "colored",
        transition: Bounce,
      });
      router.push("/");
    }
  };

  /**
   * This just clears the fields from the form
   */
  function handleReset(): void {
    setEmail("");
    setUsername("");
    setPassword("");
    setPasswordRepeat("");
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
          title="Username"
          type="text"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
