import AddPostModal from "@/components/AddPostsModal";
import { useState } from "react";

export function AddPostButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-rose-500 hover:bg-rose-700 text-white py-2 px-4 rounded-2xl shadow-lg transition"
      >
        + Add post
      </button>

      <AddPostModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
