"use client";
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const LogoutButton = () => {
    const router = useRouter();

    const handleLogout = async () => {
        // Cerrar sesión en Supabase
        await supabase.auth.signOut();

        // Eliminar cookies relacionadas con la sesión si las tienes
        document.cookie = "sb_token=; Max-Age=0; path=/";  // Borra la cookie del token

        // Redirigir al usuario a la página de inicio de sesión
        router.push("/");
    };

    return (
        <button
            onClick={handleLogout}
            className="w-full py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
        >
            Logout
        </button>
    );
};

export default LogoutButton;
