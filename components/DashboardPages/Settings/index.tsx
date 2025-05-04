//Core
import React, { ChangeEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/client";
import { useRouter } from "next/navigation";

//Elements
import SettingsIcon from "@mui/icons-material/Settings";
import { Bounce, toast } from "react-toastify";
import { useDropzone } from "react-dropzone";
import {
  LoadingScreen,
  SettingsButton,
  SettingsInput,
  SettingsInputArea,
} from "@/components/ui";

//Types
interface User {
  id: any;
  user: string;
  desc: string;
  posts: number;
  followers: number;
  followed: number;
  pfp: string;
}

/**
 * Account settings page
 */
export const AccountSettings: React.FC = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userDesc, setUserDesc] = useState<string>("");
  const [userEmail, setUserEmail] = useState<String>("");
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  /**
   * Activates after selecting a file, then changes the shown pfp locally
   * @param acceptedFiles the selected files declared in the useDropzone
   */
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);

      const localImageUrl = URL.createObjectURL(file);

      setUserData((prevUserData) => {
        if (prevUserData) {
          return { ...prevUserData, pfp: localImageUrl };
        }
        return prevUserData;
      });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    maxFiles: 1,
  });

  /**
   * Here the current user's data is fetched 
   */
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
        const userEmail = user.email;

        if (userEmail) {
          setUserEmail(userEmail);
        }

        /**
         * Select user's data from the users table using the current user's id
         */
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

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
          setUserData(data);
          setUserName(data.user);
          setUserDesc(data.desc);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  /** 
   * When changing the value in the username input
  */
  function handleChangeusername(event: ChangeEvent<HTMLInputElement>): void {
    const { value } = event.target;
    setUserName(value);
  }

  /** 
 * When changing the value in the description input
*/
  function handleChangeDesc(event: ChangeEvent<HTMLTextAreaElement>): void {
    const { value } = event.target;
    setUserDesc(value);
  }

  /**
   * After pressing the save button checks what has changed then updates the tables/storage
   */
  async function handleSave(): Promise<void> {
    /**
     * If user or description has changed, it updates the users table with the new data, then,
     *  shows a confirmation toast
     */
    if (userData?.user !== userName) {
      const { error } = await supabase
        .from("users")
        .update({ user: userName })
        .eq("id", userData?.id);

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
        toast.success("Username updated successfully", {
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
      }
    }

    if (userData?.desc !== userDesc) {
      const { error } = await supabase
        .from("users")
        .update({ desc: userDesc })
        .eq("id", userData?.id);

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
        toast.success("Description updated successfully", {
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
      }
    }
    /**
     * If there is a selected file, we send the change image function
     */
    if (selectedFile) {
      await handleChangeImage();
    }
  }

  /**
   * If there is a new image, to save it we need to update it in the storage first,
   * to do this we only need to upload it with the same name with the "upsert: true"
   * condition in the same file space
   */
  async function handleChangeImage(): Promise<void> {
    if (selectedFile && userData?.id) {
      const fileName = `${userData.id}/profile_picture.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("sportcrew-media")
        .upload(fileName, selectedFile, {
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
      /**
       * We then obtain its public url and update the pfp column in the users table by using the current
       * user's id, then we show a confirmation toast
       */
      const { data: publicUrlData } = supabase.storage
        .from("sportcrew-media")
        .getPublicUrl(fileName);

      if (publicUrlData) {
        let publicUrl = publicUrlData?.publicUrl;
        publicUrl = `${publicUrl}?t=${new Date().getTime()}`;
        const { error: updateError } = await supabase
          .from("users")
          .update({ pfp: publicUrl })
          .eq("id", userData.id);

        if (updateError) {
          toast.error("No se pudo actualizar el perfil", {
            position: "top-right",
            autoClose: 5000,
            theme: "colored",
            transition: Bounce,
          });
        } else {
          toast.success("Profile picture updated successfully", {
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
      } else {
        toast.error("Upload Error, try again later", {
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
    }
  }

  if (loading) {
    return <LoadingScreen />;
  }

  /**
   * This is only used in small screens when the logout button is visible, it sings the user out
   * then pushes it to the home page
   */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="w-full h-full px-2 py-3 lg:px-7 lg:py-5 bg-background overflow-y-auto max-h-[calc(100vh-80px)]">
      <div className="flex flex-row gap-2 justify-center md:justify-start items-center p-5">
        <SettingsIcon sx={{ fontSize: 40 }} />
        <h2 className="text-3xl font-bold">Settings</h2>
      </div>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="w-full flex flex-col gap-4 p-5 justify-center items-center"
      >
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-[500px] lg:w-[600px] border-2 border-border p-2 rounded-3xl items-center lg:items-center">
          <div className="relative w-[100px] h-[100px] min-h-[100px] min-w-[100px] rounded-full overflow-hidden">
            <img
              src={userData?.pfp || "images/noImage.jpg"}
              alt="User profile picture"
              className="rounded-full object-cover h-full w-full"
            />
          </div>
          <h1 className="font-bold">{userEmail}</h1>
          <div className="lg:ml-auto">
            <div {...getRootProps()} className="cursor-pointer">
              <input {...getInputProps()} />
              <SettingsButton title={"Change image"} type={"button"} />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full p-2 items-center">
          <SettingsInput
            title={"Username"}
            value={userName}
            subtitle={"Your username will be visible to other users."}
            onChange={handleChangeusername}
          />
          <SettingsInputArea
            title={"Description"}
            value={userDesc}
            subtitle={"Your description will be visible to other users."}
            isArea={true}
            onChange={handleChangeDesc}
          />
        </div>
        <SettingsButton
          title={"Save changes"}
          onClick={handleSave}
          type={"submit"}
        />
        <div className="block lg:hidden">
          <SettingsButton
            title={"Logout"}
            onClick={handleLogout}
            type={"submit"}
            isLogout={true}
          />
        </div>
      </form>
    </div>
  );
};
