//Core
import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

//Elements
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import EditIcon from "@mui/icons-material/Edit";
import { Bounce, toast } from "react-toastify";
import PortraitIcon from "@mui/icons-material/Portrait";

interface ProfilePictureProps {
  image?: string;
}

//Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const ProfilePicture: React.FC<ProfilePictureProps> = ({ image }) => {
  const [isHovered, setIsHovered] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpeg", ".jpg"],
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles[0]) {
        handleImageUpload(acceptedFiles[0]);
      }
    },
  });

  const handleImageUpload = async (file: File) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Unable to retrieve user");
      }

      const fileName = `${user.id}/profile_picture.jpg`;

      const { error: deleteError } = await supabase.storage
        .from("sportcrew-media")
        .remove([fileName]);

      if (deleteError && deleteError.message !== "Object not found") {
        throw new Error(deleteError.message);
      }

      const { error: uploadError } = await supabase.storage
        .from("sportcrew-media")
        .upload(fileName, file, {
          upsert: true,
        });

      if (uploadError) {
        toast.error(uploadError.message, {
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
      }

      const { data: publicUrlData } = supabase.storage
        .from("sportcrew-media")
        .getPublicUrl(fileName);

      let publicUrl = publicUrlData?.publicUrl;

      if (publicUrl) {
        publicUrl = `${publicUrl}?t=${new Date().getTime()}`;

        const { error: updateError } = await supabase
          .from("users")
          .update({ pfp: publicUrl })
          .eq("id", user.id);

        if (updateError) {
          toast.error("Unable to update profile", {
            position: "top-right",
            autoClose: 5000,
            theme: "colored",
            transition: Bounce,
          });
        } else {
          window.location.reload();
        }
      } else {
        toast.error("Error retrieving image URL", {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
          transition: Bounce,
        });
      }
    } catch (error: any) {
      toast.error("Error uploading image", {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
        transition: Bounce,
      });
      console.error("Upload error:", error.message);
    }
  };

  return (
    <div
      {...getRootProps()}
      className={`relative inline-block w-20 h-20 md:w-40 md:h-40 lg:w-80 lg:h-80 rounded-full border-4 border-border  overflow-hidden cursor-pointer transition-transform shadow-md ${
        isHovered ? "shadow-lg" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <input {...getInputProps()} className="hidden" />
      {image ? (
        <Image
          src={image}
          alt="User Avatar"
          layout="responsive"
          width={300}
          height={300}
          style={{ objectFit: "cover" }}
        />
      ) : (
        !isHovered && (
          <div className="absolute inset-0 bg-accent bg-opacity-4  flex justify-center items-center ">
            <PortraitIcon
              sx={{
                fontSize: {
                  sm: "32px",
                  md: "48px",
                },
              }}
            />
          </div>
        )
      )}

      {isHovered && (
        <div className="absolute inset-0 bg-black bg-opacity-40  flex justify-center  text-white items-center">
          <EditIcon
            sx={{
              fontSize: {
                sm: "32px",
                md: "48px",
              },
            }}
          />
        </div>
      )}
    </div>
  );
};
