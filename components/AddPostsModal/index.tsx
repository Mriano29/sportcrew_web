//Core
import { useState } from "react";
import { supabase } from "@/lib/client";

//Elements
import { FormButton } from "../ui";
import ClearIcon from "@mui/icons-material/Clear";
import ImageDropzone from "../ImageDropZone";
import { Bounce, toast } from "react-toastify";

//Types
type Props = {
  open: boolean;
  onClose: () => void;
};

/**
 * This is a modal form used in the profile to add a post
 * @param open variable which controls the opening of the modal
 * @param onClose function that controls the actions after closing the modal
 * @returns a modal menu 
 */
export default function AddPostModal({ open, onClose }: Props) {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  /**
   * This method controls the posts upload
   * @param e the formEvent used in the form, in this case, submit
   * @returns a toast showing the upload status
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    //Gets the user current session data
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    const user = sessionData?.session?.user;
    if (sessionError || !user) {
      toast.error("Error retrieving user", {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
        transition: Bounce,
      });
      setLoading(false);
      return;
    }

    try {
      /**
       * If there is a user it tries to upload a post to the posts table using the current user's ID
       * and saves the post ID
       */
      const { data: insertedPost, error: insertError } = await supabase
        .from("posts")
        .insert({ content, userId: user.id })
        .select()
        .single();

      if (insertError || !insertedPost) throw insertError;

      let mediaUrl = null;

      /**
       * If there is an Image it uploads it to the supabase storage first, then it saves the post's public url
       */
      if (imageFile) {
        const path = `${user.id}/posts/${insertedPost.id}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("sportcrew-media")
          .upload(path, imageFile);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage
          .from("sportcrew-media")
          .getPublicUrl(path);

        mediaUrl = publicUrlData.publicUrl;

        /**
         * If there were no upload errors it updates the row in the posts table using the saved id
         */
        await supabase
          .from("posts")
          .update({ media: mediaUrl })
          .eq("id", insertedPost.id);
      }

      /**
       * If everything was correct the user is shown a toast, then content and image are emptied and 
       * page is reloaded
       */

      toast.success("Post published", {
        position: "top-right",
        autoClose: 4000,
        theme: "colored",
        transition: Bounce,
      });

      setContent("");
      setImageFile(null);
      onClose();
      window.location.reload();
    } catch (err: any) {
      toast.error("Error publishing post: " + err.message, {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
        transition: Bounce,
      });
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-2">
      <div className="bg-background rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-xl"
        >
          <ClearIcon />
        </button>
        <h2 className="text-lg font-semibold mb-4">New post</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What are you thinking?"
            className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32 mb-4"
            required
          />

          <div className="mb-4">
            <ImageDropzone onFileAccepted={setImageFile} />
            {imageFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected image: {imageFile.name}
              </p>
            )}
          </div>

          <FormButton
            title={loading ? "Publishing..." : "Publish"}
            type="submit"
            disabled={loading}
          />
        </form>
      </div>
    </div>
  );
}
