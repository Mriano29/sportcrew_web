import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { Bounce, toast } from "react-toastify";
import { AddPostButton, LoadingScreen } from "../ui";
import AddIcon from '@mui/icons-material/Add';

// Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Post = {
  id: any;
  media: string | null;
  content: string;
  created_at: string;
  likes: number;
  comments: number;
};

export const UserPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        toast.error(sessionError.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
        });
        setLoading(false);
        return;
      }

      const user = sessionData?.session?.user;

      if (user) {
        const userId = user.id;

        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("userId", userId)
          .order("created_at", { ascending: false });

        if (error) {
          toast.error(error.message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            transition: Bounce,
          });
          return;
        } else {
          setPosts(data);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="text-center py-4 font-bold">This user has no posts</p>
        <AddPostButton />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full mb-[52px] overflow-y-auto p-5 lg:mb-0">
      <div className="grid grid-cols-3 gap-1 lg:gap-4">
        <div className="relative w-full h-full group">
          <button className="h-full w-full bg-accent-foreground transition-transform duration-300 ease-in-out group-hover:scale-105">
            <AddIcon
              sx={{
                fontSize: {
                  sm: 30,
                  md: 36,
                  lg: 60,
                },
              }}
            />
          </button>
        </div>
        {posts.map((post) => (
          <div
            key={post.id}
            className="relative aspect-square bg-accent rounded overflow-hidden shadow"
          >
            <div className="relative w-full h-full group">
              <Image
                src={post.media || "post"}
                alt="post"
                fill
                className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
