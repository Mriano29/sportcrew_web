//Core
import { supabase } from "@/lib/client";
import React, { useEffect, useState, KeyboardEvent, useRef } from "react";

//Elements
import { LoadingScreen } from "@/components/ui";
import { Bounce, toast } from "react-toastify";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

//Types
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

/**
 * This is the component that shows the user's chats
 */
export const Chats = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Users[]>([]);
  const [selectedUser, setSelectedUser] = useState<Users | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [channel, setChannel] = useState<ReturnType<
    typeof supabase.channel
  > | null>(null);

  /**
   * This useEffect sets the scroller at the bottom of the chat (latest message), 
   * on entering to a chat or when a new message is received
   */
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        /**
         * First the user's current session is saved
         */
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

        /**
         * Then we receive the users followed users from the followed table using its id
         */
        const { data: followedUsers, error: followedUsersError } =
          await supabase
            .from("followed")
            .select("followedUser")
            .eq("user", user.id);

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

        /**
         * If there are no users it set to empty
         */
        const followedUserIds = followedUsers?.map((u) => u.followedUser) || [];
        if (followedUserIds.length === 0) {
          setUsers([]);
          setLoading(false);
          return;
        }

        /**
         * After getting the users we ask for each of their data, their id, username and profile picture
         */
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

        /**
         * then finally their data is saved to the const
         */
        setUsers(usersData || []);
      } catch (err) {
        console.error("Unexpected error:", err);
        toast.error("An unexpected error occurred", {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
          transition: Bounce,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * This is used to load the users messages on select
   */
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;

      setLoading(true);
      try {
        //As always we get the current user's session
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) {
          setLoading(false);
          return;
        }

        /**
         * Selects everything from the chats table and filters by sender and receiver
         * then orders it
         */
        const { data, error } = await supabase
          .from("chats")
          .select("*")
          .or(
            `and(sender.eq.${user.id},receiver.eq.${selectedUser.id}),and(sender.eq.${selectedUser.id},receiver.eq.${user.id})`
          )
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching messages:", error);
          toast.error("Error loading messages", {
            position: "top-right",
            autoClose: 5000,
            theme: "colored",
            transition: Bounce,
          });
          setLoading(false);
          return;
        }

        /**
         * If there were no problems, messages are saved in the const
         */
        setMessages(data || []);
      } catch (err) {
        console.error("Unexpected error fetching messages:", err);
        toast.error("An unexpected error occurred while loading messages", {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
          transition: Bounce,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser]);

  // This sets the channel for the real time subscription
  useEffect(() => {
    const subscribeToMessages = async () => {
      if (channel) {
        await supabase.removeChannel(channel); // Cleanup previous subscription
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user || !selectedUser) {
        console.log("No user or selected user, skipping subscription");
        return;
      }

      /**
       * This sets the new subscription after selecting an user table db changes and postgres changes
       * are the defaults used by supabase to set this every event that means deletions selects and inserts
       * although realistically right now we only use insertions and selects from the chats table
       */
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
            /**
             * On change we first check if the payload is a message from these users chat, if it is
             * we update the messages const with the new data
             */
            const newMessage = payload.new as Message;
            if (
              newMessage &&
              (newMessage.sender === selectedUser?.id ||
                newMessage.receiver === selectedUser?.id)
            ) {
              setMessages((prev) => {
                if (prev.some((msg) => msg.id === newMessage.id)) {
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

    /**
     * If an user is selected triggers the subscription change method
     */
    if (selectedUser) {
      subscribeToMessages();
    }

    /**
     * triggers when a new selected user is set to avoid channel problems
     */
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
        setChannel(null);
      }
    };
  }, [selectedUser]);

  /**
   * Used to let the user use the enter key to send messages
   * @param e the pressed key
   */
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  //Send messages
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) return;

    setIsSending(true);
    /**
     * Inserts to chats table a new row containing the message, the sender and the receiver
     */
    const { error } = await supabase.from("chats").insert({
      sender: user.id,
      receiver: selectedUser.id,
      message,
    });

    if (error) {
      toast.error("Failed to send message", {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
        transition: Bounce,
      });
      setIsSending(false);
      return;
    }

    /**
     * On send we set the message box to empty
     */
    setMessage("");
    setIsSending(false);
  };

  if (loading) return <LoadingScreen />;

  return (
    <main className="w-full h-full flex flex-row px-2 py-3 lg:px-7 lg:py-5 max-h-[calc(100vh-60px)] lg:max-h-max gap-2">
      {/* Users list */}
      <div
        className={`h-full w-full md:max-w-[300px] overflow-y-auto space-y-2 border-2 border-border p-2 block
    ${selectedUser ? "hidden md:block" : ""}`}
      >
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
                <img
                  src={u.pfp || "images/noImage.jpg"}
                  alt={u.user}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-sm font-medium">{u.user}</span>
              </div>
              <div className="w-[95%] border border-gray-400 mx-auto" />
            </div>
          ))
        )}
      </div>

      {/* Chat view -  in small screens it only appears when an user is selected*/}
      <div
        className={`h-full w-full flex-col ${selectedUser ? "flex" : "hidden md:flex"
          }`}
      >
        {selectedUser ? (
          <>
            <div className="flex items-center gap-3 p-4 border-b w-full">
              <button
                onClick={() => setSelectedUser(null)}
                className="md:hidden text-sm text-blue-500 hover:underline"
              >
                <ArrowBackIosIcon />
              </button>

              <img
                src={selectedUser.pfp || "images/noImage.jpg"}
                alt={selectedUser.user}
                className="w-10 h-10 rounded-full object-cover"
              />
              <h2 className="text-lg font-semibold">{selectedUser.user}</h2>
            </div>
            <div className="flex-1 w-full p-4 overflow-y-auto flex flex-col gap-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === selectedUser.id
                      ? "justify-start"
                      : "justify-end"
                    }`}
                >
                  <div
                    className={`p-2 rounded max-w-[70%] ${msg.sender === selectedUser.id
                        ? "bg-accent"
                        : "bg-accent-foreground"
                      }`}
                  >
                    {msg.message}
                    <div ref={messagesEndRef} />
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
