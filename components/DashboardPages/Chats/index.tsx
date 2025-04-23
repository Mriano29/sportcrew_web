import { LoadingScreen } from "@/components/ui";
import { createClient } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";
import { Bounce, toast } from "react-toastify";

// Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Users = {
  id: string;
  user: string;
  pfp: string;
};

export const Chats = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Users[]>([]);
  const [selectedUser, setSelectedUser] = useState<Users | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          toast.error(sessionError.message, {
            position: "top-right",
            autoClose: 5000,
            theme: "colored",
            transition: Bounce,
          });
          setLoading(false);
          return;
        }

        const user = sessionData?.session?.user;
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: followedUsers, error: followedUsersError } =
          await supabase
            .from("followed")
            .select("followed_user")
            .eq("id", user.id);

        if (followedUsersError) {
          toast.error(followedUsersError.message, {
            position: "top-right",
            autoClose: 5000,
            theme: "colored",
            transition: Bounce,
          });
          setLoading(false);
          return;
        }

        const followedUserIds =
          followedUsers?.map((u) => u.followed_user) || [];

        if (followedUserIds.length === 0) {
          setUsers([]);
          return;
        }

        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, user, pfp")
          .in("id", followedUserIds);

        if (usersError) {
          toast.error(usersError.message, {
            position: "top-right",
            autoClose: 5000,
            theme: "colored",
            transition: Bounce,
          });
          setLoading(false);
          return;
        }

        setUsers(usersData || []);
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    console.log(`Mensaje a ${selectedUser?.user}:`, message);
    setMessage(""); // Limpiar input
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <main className="w-full h-full flex flex-row px-2 py-3 lg:px-7 lg:py-5 max-h-[calc(100vh-60px)] lg:max-h-max gap-2">
      <div className="h-full w-full md:max-w-[300px] overflow-y-auto space-y-2 border-2 border-border p-2 block">
        {users.map((u) => (
          <div
            key={u.id}
            onClick={() => setSelectedUser(u)}
            className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors 
              ${selectedUser?.id === u.id ? "bg-accent" : "hover:bg-accent"}`}
          >
            <img
              src={u.pfp}
              alt={u.user}
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="text-sm font-medium">{u.user}</span>
          </div>
        ))}
        <div className="w-[95%] border border-gray-400 mx-auto" />
      </div>

      <div className="h-full w-full items-center hidden md:flex flex-col">
        {selectedUser ? (
          <>
            {/* Header del chat */}
            <div className="flex items-center gap-3 p-4 border-b w-full">
              <img
                src={selectedUser.pfp}
                alt={selectedUser.user}
                className="w-10 h-10 rounded-full object-cover"
              />
              <h2 className="text-lg font-semibold">{selectedUser.user}</h2>
            </div>

            {/* Contenido del chat (puedes agregar aquí los mensajes) */}
            <div className="flex-1 w-full p-4 overflow-y-auto">
              <p className="text-sm text-muted">Aquí irán los mensajes...</p>
            </div>

            {/* Input de envío */}
            <div className="w-full p-4 border-t flex items-center gap-2">
              <input
                type="text"
                className="flex-1 p-2 rounded border border-border bg-transparent outline-none"
                placeholder="Escribe un mensaje..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                Enviar
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            Selecciona un usuario para comenzar un chat
          </div>
        )}
      </div>
    </main>
  );
};
