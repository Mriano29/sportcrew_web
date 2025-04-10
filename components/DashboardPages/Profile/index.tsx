import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

//Elements
import {
  LoadingScreen,
  ProfileInput,
  ProfileLabel,
} from "@/components/ui";
import { Bounce, toast } from "react-toastify";
import { ProfilePicture } from "@/components/ProfilePicture";

// Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

export const Profile = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<string>("");
  const [desc, setDesc] = useState<string>("");

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
          setUser(data?.user || "");
          setDesc(data?.desc || "");
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleChangeUser = (e: string) => {
    setUser(e);
  };

  const handleChangeDesc = (e: string) => {
    setDesc(e);
  };

  const handleSaveChanges = async () => {
    const { error } = await supabase
      .from("users")
      .update({ user, desc })
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
    } else {
      toast.dismiss();
      toast.success("Changes saved successfully!", {
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
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-full w-full flex flex-col lg:flex-row p-2">
      <div className="flex flex-row lg:flex-col gap-5 bg-card p-5 border-2  border-border rounded-3xl">
        <ProfilePicture image={userData?.pfp} />
        <div className="flex flex-col gap-3">
          <ProfileInput
            value={user}
            onChange={(e) => handleChangeUser(e.target.value)}
          />
          <ProfileInput
            value={desc}
            isDescription
            onChange={(e) => handleChangeDesc(e.target.value)}
          />
          <button onClick={handleSaveChanges}>guardar</button>
          <div className="flex flex-row lg:flex-col gap-3 align">
            <ProfileLabel title={"Posts:"} value={userData?.posts} />
            <ProfileLabel title={"Followers:"} value={userData?.followers} />
            <ProfileLabel title={"Followed:"} value={userData?.followed} />
          </div>
        </div>
      </div>
      <div className=""></div>
    </div>
  );
};
