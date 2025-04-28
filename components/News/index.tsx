import { useEffect, useState } from "react";
import Image from "next/image";
import { Bounce, toast } from "react-toastify";
import { LoadingScreen } from "../ui";
import { PostInfo } from "../PostInfo";
import { supabase } from "@/lib/client";


type Post = {
  id: any;
  media: string | null;
  content: string;
  created_at: string;
  likes: number;
  comments: number;
  users: {
    pfp: string;
    user: string;
  };
};

export const News = () => {
  const [posts, setPosts] = useState<Post[]>([]);
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
          .select("followedUser")
          .eq("user", user.id);

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
          followedData?.map((item) => item.followedUser) || [];

        // 2. Obtener últimos 5 posts por cada usuario seguido
        const allPosts: Post[] = [];

        for (const userId of followedUserIds) {
          const { data: postsData, error: postsError } = await supabase
            .from("posts")
            .select("*, users(user, pfp)")
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
              <div className="flex flex-row w-full items-center p-3 gap-3">
                <div className="relative w-[30px] h-[30px]">
                  <Image
                    src={post.users.pfp || ""}
                    alt="User profile picture"
                    fill
                    sizes="30px"
                    className="rounded-full object-cover"
                  />
                </div>
                <div className="bg-accent font-bold">
                  <h1>{post.users.user}</h1>
                </div>
              </div>
              <div className="relative w-full h-full group">
                <Image
                  src={post.media || ""}
                  alt="Post image"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
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
