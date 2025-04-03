"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormInput } from "../ui/FormInput";
import { FormButton } from "../ui/FormButton";
import { createClient } from "@supabase/supabase-js";

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

        if (password !== passwordRepeat) {
            setError("Passwords do not match.");
            return;
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            // Redirige al usuario tras el registro (ajusta la ruta según tu necesidad)
            router.push("/");
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
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex flex-row gap-5">
                    <FormButton title="Sign up" type="submit" />
                    <FormButton title="Clear" type="reset" secondVariant onClick={handleReset} />
                </div>
            </form>
            <div className="flex items-center my-6">
                <div className="flex-grow border-t border-muted-foreground" />
                <span className="mx-4 text-muted-foreground">or</span>
                <div className="flex-grow border-t border-muted-foreground" />
            </div>
            <FormButton
                title="Log in to your account"
                type="button"
                thirdVariant
                onClick={() => router.push("/")}
            />
        </div>
    );
};
