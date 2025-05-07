//Core
import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";

//Elements
import { Bounce, toast } from "react-toastify";
import { LoadingScreen } from "../ui";
import { PostInfo } from "../PostInfo";

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
        /**
         * Obtain the current session
         */
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

        /**
         * If there are no problems we set a const with the current user
         */
        const user = sessionData?.session?.user;

        if (!user) {
          setLoading(false);
          return;
        }

        /**
         * Obtain followed users from followed table by using the current user's id
         */
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

        /**
         * If there are no problems we save the followed users ids in this const
         */
        const followedUserIds =
          followedData?.map((item) => item.followedUser) || [];

        const allPosts: Post[] = [];
        /**
         *Now by using the saved id's we create a for loop to obtain the last 5 posts from each users,
         their username and profile picture, and order them from lastest to oldest
         */
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

          /**
           * After the data is obtained we add the fetched posts with its user to the all posts const
           */
          if (postsData) {
            allPosts.push(...postsData);
          }
        }

        /**
         * Finally this method is used to order every obtained post from latest to oldest
         * since when we obtained it from the database it only took into account the ones from each user
         */
        allPosts.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        /**
         * Then the const posts is set to this data
         */
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

  /**
   * This method is the intermediary between postInfo and the news component
   * when a post is clicked it sets the selected post to it and opens the post info modal
   *
   * @param post the clicked post
   */
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
                  <img
                    src={post.users.pfp || "images/noImage.jpg"}
                    alt="User profile picture"
                    loading="lazy"
                    className="rounded-full object-cover w-[30px] h-[30px]"
                  />
                </div>
                <div className="bg-accent font-bold">
                  <h1>{post.users.user}</h1>
                </div>
              </div>
              <div className="relative w-full h-full group">
                <img
                  src={post.media || "images/noImage.jpg"}
                  alt="Post image"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-fit w-full h-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/**
       * This is the post info modal
       */}
      <PostInfo
        open={openPostInfo}
        onClose={() => setOpenPostInfo(false)}
        post={selectedPost}
      />
    </>
  );
};
