import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { Bounce, toast } from "react-toastify";
import { AddPostButton, LoadingScreen } from "../ui";
import AddIcon from "@mui/icons-material/Add";
import PostIcon from "@mui/icons-material/Image";
import { PostInfo } from "../PostInfo";

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

export const News = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [openPostInfo, setOpenPostInfo] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post>();

  useEffect(() => {
    const fetchData = async () => {
      try {
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

        if (!user) {
          setLoading(false);
          return;
        }

        // 1. Obtener usuarios seguidos
        const { data: followedData, error: followedError } = await supabase
          .from("followed")
          .select("followed_user")
          .eq("id", user.id);

        if (followedError) {
          toast.error(followedError.message, {
            position: "top-right",
            autoClose: 5000,
            theme: "colored",
            transition: Bounce,
          });
          setLoading(false);
          return;
        }

        const followedUserIds =
          followedData?.map((item) => item.followed_user) || [];
        setFollowedUsers(followedUserIds);

        // 2. Obtener últimos 5 posts por cada usuario seguido
        const allPosts: Post[] = [];

        for (const userId of followedUserIds) {
          const { data: postsData, error: postsError } = await supabase
            .from("posts")
            .select("*")
            .eq("userId", userId)
            .order("created_at", { ascending: false })
            .limit(5);

          if (postsError) {
            console.error(
              `Error fetching posts for user ${userId}:`,
              postsError.message
            );
            continue;
          }

          if (postsData) {
            allPosts.push(...postsData);
          }
        }

        // 3. Ordenar todos los posts por fecha
        allPosts.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setPosts(allPosts);
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (posts.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <p className="text-center py-4 font-bold">Nothing to show...</p>
      </div>
    );
  }

  function handleShowPostInfo(post: Post): void {
    if (post) {
      setSelectedPost(post);
      setOpenPostInfo(true);
    } else {
      toast.error("Unable to retrieve post information.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
    }
  }

  return (
    <>
      <div className="relative w-full h-full  p-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="relative aspect-square bg-accent rounded overflow-hidden shadow"
              onClick={() => handleShowPostInfo(post)}
            >
              <div className="bg-accent p-3">
                <h1>usuario</h1>
              </div>
              <div className="relative w-full h-full group">
                <Image
                  src={post.media || ""}
                  alt="post"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <PostInfo
        open={openPostInfo}
        onClose={() => setOpenPostInfo(false)}
        post={selectedPost}
      />
    </>
  );
};
