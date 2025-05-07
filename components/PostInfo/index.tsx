import ClearIcon from "@mui/icons-material/Clear";
import { useEffect, useState, useCallback } from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { FormInput } from "../ui";
import SendIcon from "@mui/icons-material/Send";
import { supabase } from "@/lib/client";

export const PostInfo = ({
  open,
  onClose,
  post,
}: {
  open: boolean;
  onClose: () => void;
  post: any;
}) => {
  const [username, setUsername] = useState<string | null>(null);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [comment, setComment] = useState<string>("");
  const [commentList, setCommentList] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    if (!post?.id || !post?.userId) return;

    try {
      /**
       * Here I used promise all to make all of this calls at the same time,
       * it obtains the post that made the post, its like count, the current session's user
       * and finally the comments from the current post which means the user that made it
       * and its content
       */
      const [userRes, likeCountRes, sessionRes, commentsRes] =
        await Promise.all([
          supabase.from("users").select("user").eq("id", post.userId).single(),
          supabase
            .from("likes")
            .select("*", { count: "exact" })
            .eq("postID", post.id),
          supabase.auth.getSession(),
          supabase
            .from("comments")
            .select("userId, content")
            .order("created_at", { ascending: false })
            .eq("postId", post.id),
        ]);

      /**
       * If the comments were obtained succesfully, another consult is made,
       * by using each commentor's id we obtain its username and save it in the
       * comments with usernames const, right after the loop finishes, data is copied to
       * the comment list const
       */
      if (!commentsRes.error) {
        const commentsWithUsernames = await Promise.all(
          commentsRes.data.map(async (comment: any) => {
            const userRes = await supabase
              .from("users")
              .select("user")
              .eq("id", comment.userId)
              .single();

            return {
              ...comment,
              username: userRes.data?.user || "Unknown User",
            };
          })
        );
        setCommentList(commentsWithUsernames);
      }

      /**
       * Here we set the posts user username
       */
      if (userRes.error) {
        console.error("Error fetching username:", userRes.error);
        setUsername(null);
      } else {
        setUsername(userRes.data?.user || null);
      }

      /**
       * Here we set the posts like count
       */
      if (likeCountRes.error) {
        console.error("Error fetching like count:", likeCountRes.error);
        setLikeCount(0);
      } else {
        setLikeCount(likeCountRes.count || 0);
      }

      /**
       * Here we set the current user's session,  and now we check if the post has been liked
       * by the current user by using the post id and the current session user's id in the likes
       * table
       */
      if (sessionRes.error) {
        console.error("Error fetching user session:", sessionRes.error);
      } else {
        const sessionUser = sessionRes.data.session?.user;
        setUser(sessionUser);

        if (sessionUser?.id) {
          const likedRes = await supabase
            .from("likes")
            .select("*")
            .eq("postID", post.id)
            .eq("userID", sessionUser.id)
            .single();

          if (likedRes.error) {
            console.warn(
              "Could not fetch liked status:",
              likedRes.error.message
            );
            setIsLiked(false);
          } else {
            setIsLiked(!!likedRes.data);
          }
        }
      }
    } catch (err) {
      console.error("Unexpected error during data fetch:", err);
    }
  }, [post?.id, post?.userId]);

  /**
   * This updates the data when the modal is opened
   */
  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, fetchData]);

  /**
   * This first checks if the post has been liked, if not it inserts a row into the likes table,
   * sums a like to thepost and sets the liked status to true this works asynchronously to
   * avoid lag
   */
  const handleLike = useCallback(async () => {
    if (!post?.id || !user || isLiked) return;

    try {
      const { error } = await supabase.from("likes").insert([
        {
          postID: post.id,
          userID: user.id,
        },
      ]);

      if (error) {
        console.error("Error adding like:", error);
      } else {
        setLikeCount((prev) => prev + 1);
        setIsLiked(true);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  }, [post?.id, user, isLiked]);

  if (!open) return null;

  /**
   * This constrols changes in the comment input and sets the comment const accordingly
   */
  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value);
  };

  /**
   * This checks if there is a valid comment currently, if there is it inserts the data into the comments
   * table
   */
  const handleComment = async () => {
    if (!post?.id || !user || !comment || comment === "") return;

    try {
      const { error } = await supabase.from("comments").insert([
        {
          postId: post.id,
          userId: user.id,
          content: comment,
        },
      ]);

      if (error) {
        console.error("Error adding comment:", error);
      } else {
        setComment("");
        fetchData();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40 p-2 sm:p-4">
      <div className="bg-background rounded-lg shadow-lg w-full h-full max-w-[calc(100vw-50px)] lg:max-w-6xl relative overflow-hidden flex flex-col max-h-[calc(100vh-150px)] lg:max-h-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-foreground hover:text-red-700 text-xl z-50"
        >
          <ClearIcon />
        </button>
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden w-full">
          <div className="relative w-full h-64 sm:h-80 lg:h-auto lg:flex-1">
            <img
              src={post.media}
              alt="post"
              className="object-fit  w-full h-64 sm:h-80 lg:h-full"
            />
          </div>
          <div className="flex flex-col lg:flex-1 p-2 sm:p-4 h-full overflow-auto">
            <div className="flex flex-row mb-2">
              <div className="flex-1 flex-col gap-2 mb-2">
                <h1 className="font-bold">{username}:</h1>
                <h2 className="break-words">{post.content}</h2>
              </div>
              <div className="flex-1 flex-row gap-2 items-center justify-center w-full">
                <FavoriteIcon
                  onClick={handleLike}
                  sx={{
                    fontSize: {
                      xs: 20,
                      sm: 24,
                      md: 28,
                    },
                    color: isLiked ? "red" : "inherit",
                    cursor: isLiked ? "not-allowed" : "pointer",
                  }}
                />
                <span>{likeCount}</span>
              </div>
            </div>
            <div className="flex flex-col overflow-y-auto pr-1 border-t border-border py-5">
              <h1 className="font-bold mb-2">Comments:</h1>
              {commentList.length > 0 ? (
                commentList.map((comment, index) => (
                  <div key={index} className="mb-1">
                    <p>
                      <strong>{comment.username}:</strong> {comment.content}
                    </p>
                  </div>
                ))
              ) : (
                <p>No comments yet.</p>
              )}
            </div>
            <div className="mt-auto pt-2 flex flex-row gap-2 items-center border-t border-border justify-center">
              <FormInput
                type="text"
                value={comment}
                placeholder="Say something!"
                onChange={handleCommentChange}
              />
              <SendIcon
                onClick={handleComment}
                className="text-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
