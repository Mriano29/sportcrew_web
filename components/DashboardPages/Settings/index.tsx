import React, { ChangeEvent, useEffect, useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { Bounce, toast } from "react-toastify";
import { FormInput } from "@/components/ui";

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

export const AccountSettings: React.FC = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [userName, setUserName] = useState<String>("");
  const [userDesc, setUserDesc] = useState<String>("");
  const [userEmail, setUserEmail] = useState<String>("");
  const [loading, setLoading] = useState(true);

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
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleSave = () => {};

  function handleChangeusername(event: ChangeEvent<HTMLInputElement>): void {
    const { value } = event.target;
    setUserName(value);
  }

  function handleChangeDesc(event: ChangeEvent<HTMLInputElement>): void {
    const { value } = event.target;
    setUserDesc(value);
  }

  return (
    <div className="w-full h-full  px-2 py-3 lg:px-7 lg:py-5 bg-background">
      <div className="flex flex-row gap-2 justify-center md:justify-start items-center p-5">
        <SettingsIcon sx={{ fontSize: 40 }} />
        <h2 className="text-3xl font-bold">Settings</h2>
      </div>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="w-full flex flex-col gap-4 p-5 justify-center items-center"
      >
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-[500px] lg:w-[600px] border-2 border-border p-2 rounded-3xl items-center lg:items-center">
          <div className="relative w-[100px] h-[100px]">
            {userData?.pfp ? (
              <Image
                src={userData.pfp}
                alt="User profile picture"
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                <span>No Image</span>
              </div>
            )}
          </div>
          <h1 className="font-bold">{userEmail}</h1>
          <button className="md:ml-auto border-2 p-1 rounded-xl bg-accent text-white sm:w-fit w-[80%]">
            Change image
          </button>
        </div>
        <div className="flex flex-col gap-2 w-full  p-2 items-center">
          <FormInput
            type={"text"}
            value={userData?.user}
            onChange={handleChangeusername}
          />
          <FormInput
            type={"text"}
            value={userData?.desc}
            onChange={handleChangeDesc}
          />
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="w-fit border-2 p-2 rounded-xl"
        >
          Save
        </button>
      </form>
    </div>
  );
};
