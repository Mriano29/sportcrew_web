import { useState } from "react";
import { FormButton } from "../ui";
import ClearIcon from "@mui/icons-material/Clear";
import { createClient } from "@supabase/supabase-js";
import ImageDropzone from "../ImageDropZone";
import { Bounce, toast } from "react-toastify";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AddPostModal({ open, onClose }: Props) {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    const user = sessionData?.session?.user;
    if (sessionError || !user) {
      toast.error("Error obteniendo usuario", {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
        transition: Bounce,
      });
      setLoading(false);
      return;
    }

    try {
      // Paso 1: Insertar el post sin imagen aún
      const { data: insertedPost, error: insertError } = await supabase
        .from("posts")
        .insert({ content, userId: user.id })
        .select()
        .single();

      if (insertError || !insertedPost) throw insertError;

      let mediaUrl = null;

      // Paso 2: Si hay imagen, subirla al bucket
      if (imageFile) {
        const path = `${user.id}/posts/${insertedPost.id}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("sportcrew-media")
          .upload(path, imageFile);

        if (uploadError) throw uploadError;

        // Paso 3: Obtener URL pública
        const { data: publicUrlData } = supabase.storage
          .from("sportcrew-media")
          .getPublicUrl(path);

        mediaUrl = publicUrlData.publicUrl;

        // Paso 4: Actualizar post con media_url
        await supabase
          .from("posts")
          .update({ media: mediaUrl })
          .eq("id", insertedPost.id);
      }

      toast.success("¡Post publicado!", {
        position: "top-right",
        autoClose: 4000,
        theme: "colored",
        transition: Bounce,
      });

      // Reset form
      setContent("");
      setImageFile(null);
      onClose();
    } catch (err: any) {
      toast.error("Error al publicar post: " + err.message, {
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
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
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
            placeholder="¿Qué estás pensando?"
            className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32 mb-4"
            required
          />

          <div className="mb-4">
            <ImageDropzone onFileAccepted={setImageFile} />
            {imageFile && (
              <p className="mt-2 text-sm text-gray-600">
                Imagen seleccionada: {imageFile.name}
              </p>
            )}
          </div>

          <FormButton
            title={loading ? "Publicando..." : "Publish"}
            type="submit"
            disabled={loading}
          />
        </form>
      </div>
    </div>
  );
}
