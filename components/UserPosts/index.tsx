import { useEffect, useState } from "react";
import { Bounce, toast } from "react-toastify";
import { AddPostButton, LoadingScreen } from "../ui";
import AddIcon from "@mui/icons-material/Add";
import AddPostModal from "../AddPostsModal";
import PostIcon from "@mui/icons-material/Image";
import { PostInfo } from "../PostInfo";
import { supabase } from "@/lib/client";

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
  const [open, setOpen] = useState(false);
  const [openPostInfo, setOpenPostInfo] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post>();

  const handleAddPost = () => {
    setOpen(true);
  };

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
      <div className="relative w-full h-full mb-[52px] overflow-y-auto p-5 lg:mb-0">
        <div className="grid grid-cols-3 gap-1 lg:gap-4">
          <div className="relative w-full h-full group">
            <button
              className="h-full w-full bg-accent-foreground transition-transform duration-300 ease-in-out group-hover:scale-105"
              onClick={handleAddPost}
            >
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
              onClick={() => handleShowPostInfo(post)}
            >
              <div className="relative w-full h-full group">
                {post.media ? (
                  <img
                    src={post.media}
                    alt="post"
                    className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105 h-full w-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-200 transition-transform duration-300 ease-in-out group-hover:scale-105">
                    <PostIcon sx={{ fontSize: 60, color: "gray" }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <AddPostModal open={open} onClose={() => setOpen(false)} />
      <PostInfo
        open={openPostInfo}
        onClose={() => setOpenPostInfo(false)}
        post={selectedPost}
      />
    </>
  );
};
