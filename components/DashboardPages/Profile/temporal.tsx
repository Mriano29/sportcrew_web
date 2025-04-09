import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

//Elements
import { LoadingScreen } from "@/components/ui";
import { Bounce, toast } from "react-toastify";
import { ProfilePicture } from "@/components/ProfilePicture";

// Inicializa Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const Profile = () => {
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [isEdited, setIsEdited] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        toast.error(sessionError.message, {
          position: "top-left",
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
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          toast.error(error.message, {
            position: "top-left",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            transition: Bounce,
          });
        } else {
          setUserData(data);
          setUser(data?.user || "");
          setDesc(data?.desc || "");
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleChange = () => {
    if (user !== userData?.user || desc !== userData?.desc) {
      setIsEdited(true);
    } else {
      setIsEdited(false);
    }
  };

  const handleSaveChanges = async () => {
    const { error } = await supabase
      .from("users")
      .update({ user, desc })
      .eq("id", userData?.id);

    if (error) {
      toast.error(error.message, {
        position: "top-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
    } else {
      toast.success("Changes saved successfully!", {
        position: "top-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
      setIsEdited(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col lg:flex-row h-full w-full mb-4 lg:w-44 lg:p-10">
      <div className="">
        <div className="flex flex-row lg:flex-col lg:-44 p-10 lg:p-0 gap-5 lg:gap-10 flex-1">
          <ProfilePicture image={userData?.pfp} />
          <div className="flex flex-1 flex-col ">
            <h1 className="text-2xl md:text-3xl font-bold text-primary mb-4 text-center overflow-ellipsis">
              <input
                type="text"
                value={user}
                onChange={(e) => {
                  setUser(e.target.value);
                  handleChange();
                }}
                className="text-2xl md:text-3xl font-bold text-primary text-center w-full bg-inherit"
              />
            </h1>
            <textarea
              value={desc}
              onChange={(e) => {
                setDesc(e.target.value);
                handleChange();
              }}
              className="text-md text-center lg:text-left overflow-auto w-full bg-inherit resize-none min-h-12"
            />
          </div>
        </div>
      </div>
      
    </div>
  );
};
