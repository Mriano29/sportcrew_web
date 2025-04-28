import { LoadingScreen } from "@/components/ui";
import { supabase } from "@/lib/client";
import React, { useEffect, useState, KeyboardEvent } from "react";
import { Bounce, toast } from "react-toastify";

type Users = {
  id: string;
  user: string;
  pfp: string;
};

type Message = {
  id: string;
  sender: string;
  receiver: string;
  message: string;
  created_at: string;
};

export const Chats = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Users[]>([]);
  const [selectedUser, setSelectedUser] = useState<Users | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [channel, setChannel] = useState<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          toast.error(sessionError.message, { position: "top-right", autoClose: 5000, theme: "colored", transition: Bounce });
          setLoading(false);
          return;
        }

        const user = sessionData?.session?.user;
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: followedUsers, error: followedUsersError } =
          await supabase.from("followed").select("followedUser").eq("user", user.id);

        if (followedUsersError) {
          toast.error(followedUsersError.message, { position: "top-right", autoClose: 5000, theme: "colored", transition: Bounce });
          setLoading(false);
          return;
        }

        const followedUserIds = followedUsers?.map((u) => u.followedUser) || [];
        if (followedUserIds.length === 0) {
          setUsers([]);
          setLoading(false);
          return;
        }

        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, user, pfp")
          .in("id", followedUserIds);

        if (usersError) {
          toast.error(usersError.message, { position: "top-right", autoClose: 5000, theme: "colored", transition: Bounce });
          setLoading(false);
          return;
        }

        setUsers(usersData || []);
      } catch (err) {
        console.error("Unexpected error:", err);
        toast.error("An unexpected error occurred", { position: "top-right", autoClose: 5000, theme: "colored", transition: Bounce });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Obtener mensajes al seleccionar usuario
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;

      setLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("chats")
          .select("*")
          .or(`and(sender.eq.${user.id},receiver.eq.${selectedUser.id}),and(sender.eq.${selectedUser.id},receiver.eq.${user.id})`)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching messages:", error);
          toast.error("Error loading messages", { position: "top-right", autoClose: 5000, theme: "colored", transition: Bounce });
          setLoading(false);
          return;
        }

        setMessages(data || []);
      } catch (err) {
        console.error("Unexpected error fetching messages:", err);
        toast.error("An unexpected error occurred while loading messages", { position: "top-right", autoClose: 5000, theme: "colored", transition: Bounce });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser]);

  // Subscripción en tiempo real
  useEffect(() => {
    const subscribeToMessages = async () => {
      if (channel) {
        await supabase.removeChannel(channel);  // Cleanup previous subscription
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user || !selectedUser) {
        console.log('No user or selected user, skipping subscription');
        return;
      }

      const newChannel = supabase
        .channel("table-db-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "chats",
          },
          (payload) => {
            console.log('Received message:', payload);
            const newMessage = payload.new as Message;
            if (newMessage && (newMessage.sender === selectedUser?.id || newMessage.receiver === selectedUser?.id)) {
              setMessages(prev => {
                if (prev.some(msg => msg.id === newMessage.id)) {
                  return prev;
                }
                return [...prev, newMessage];
              });
            }
          }
        )
        .subscribe();

      setChannel(newChannel);
    };

    if (selectedUser) {
      subscribeToMessages();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
        setChannel(null);
      }
    };
  }, [selectedUser]);

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Enviar mensaje
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) return;

    setIsSending(true);
    const { error } = await supabase.from("chats").insert({
      sender: user.id,
      receiver: selectedUser.id,
      message,
    });

    if (error) {
      toast.error("Failed to send message", { position: "top-right", autoClose: 5000, theme: "colored", transition: Bounce });
      setIsSending(false);
      return;
    }

    setMessage("");
    setIsSending(false);
  };

  if (loading) return <LoadingScreen />;

  return (
    <main className="w-full h-full flex flex-row px-2 py-3 lg:px-7 lg:py-5 max-h-[calc(100vh-60px)] lg:max-h-max gap-2">
      <div className="h-full w-full md:max-w-[300px] overflow-y-auto space-y-2 border-2 border-border p-2 block">
        {users.length === 0 ? (
          <div className="text-center text-muted p-4">
            No followed users found
          </div>
        ) : (
          users.map((u) => (
            <div key={u.id}>
              <div
                onClick={() => setSelectedUser(u)}
                className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors 
            ${selectedUser?.id === u.id ? "bg-accent" : "hover:bg-accent"}`}
                role="button"
                tabIndex={0}
              >
                <img src={u.pfp} alt={u.user} className="w-10 h-10 rounded-full object-cover" />
                <span className="text-sm font-medium">{u.user}</span>
              </div>
              <div className="w-[95%] border border-gray-400 mx-auto" />
            </div>
          ))
        )}
      </div>

      <div className="h-full w-full items-center hidden md:flex flex-col">
        {selectedUser ? (
          <>
            <div className="flex items-center gap-3 p-4 border-b w-full">
              <img src={selectedUser.pfp} alt={selectedUser.user} className="w-10 h-10 rounded-full object-cover" />
              <h2 className="text-lg font-semibold">{selectedUser.user}</h2>
            </div>

            <div className="flex-1 w-full p-4 overflow-y-auto flex flex-col gap-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === selectedUser.id ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`p-2 rounded max-w-[70%] ${msg.sender === selectedUser.id
                      ? "bg-accent"
                      : "bg-accent-foreground text-white"
                      }`}
                  >
                    {msg.message}
                    <div className="text-xs text-right opacity-50">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full p-4 border-t flex items-center gap-2">
              <input
                type="text"
                className="flex-1 p-2 rounded border border-border bg-transparent outline-none"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSending}
                aria-label="Message input"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50"
                disabled={isSending || !message.trim()}
                aria-label="Send message"
              >
                {isSending ? "Sending..." : "Send"}
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            Select a user to start chatting
          </div>
        )}
      </div>
    </main>
  );
};
