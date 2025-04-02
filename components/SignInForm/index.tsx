"use client";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { useState } from "react";
import { FormInput } from '../ui/FormInput';
import { FormButton } from '../ui/FormButton';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SignInFormProps { }

export const SignInForm: React.FC<SignInFormProps> = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            router.push("/google.com");
        }
    };

    const gotoSignup = (event: React.MouseEvent) => {
        event.preventDefault();
        router.push("/signup");
    };

    return (
        <div className='bg-card border-2 border-border rounded-3xl p-10'>
            <div className="mb-6 flex flex-col justify-center items-center">
                <Image
                    className="object-contain"
                    src="/images/sportcrewlogo.png"
                    width={100}
                    height={100}
                    alt="SportCrew Logo"
                />
                <h1 className="text-2xl font-semibold mt-2 text-center">Welcome to Sportcrew</h1>
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
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <FormButton title="Sign in" type="submit" />
            </form>
            <div className="flex items-center my-6">
                <div className="flex-grow border-t border-muted-foreground" />
                <span className="mx-4 text-muted-foreground">OR</span>
                <div className="flex-grow border-t border-muted-foreground" />
            </div>
            <FormButton title="Create an account" type="button" thirdVariant onClick={gotoSignup} />
        </div>
    );
};
