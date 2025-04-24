//Core
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

//Elements
import Image from "next/image";
import { Bounce, toast } from "react-toastify";
import { LoadingScreen } from "@/components/ui";
import { UserPosts } from "@/components/UserPosts";

// Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

//Types
interface User {
  user: string;
  desc: string;
  pfp: string;
}

export const Profile = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [postNumber, setPostNumber] = useState<number>(0);
  const [followedNumber, setFollowedNumber] = useState<number>(0);
  const [followersNumber, setFollowersNumber] = useState<number>(0);
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

        const { data: fetchedUser, error: fetchedUserError } = await supabase
          .from("users")
          .select("user, desc, pfp")
          .eq("id", userId)
          .single();

        const { count: postCount, error: postCountError } = await supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("userId", userId);

        const { count: followedCount, error: followedCountError } = await supabase
          .from("followed")
          .select("*", { count: "exact", head: true })
          .eq("user", userId);

        const { count: followersCount, error: followersCountError } = await supabase
          .from("followers")
          .select("*", { count: "exact", head: true })
          .eq("user", userId);

        if (fetchedUserError) {
          toast.error(fetchedUserError.message, {
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
        } else if (postCountError) {
          toast.error(postCountError.message, {
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

        } else if (followedCountError) {
          toast.error(followedCountError.message, {
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

        } else if (followersCountError) {
          toast.error(followersCountError.message, {
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
          setUserData(fetchedUser);
          setPostNumber(postCount || 0);
          setFollowedNumber(followedCount || 0);
          setFollowersNumber(followersCount || 0);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <main className="h-full w-full flex flex-col items-center px-2 py-3 lg:px-7 lg:py-5 gap-4">
      <div className="flex flex-row gap-4 lg:gap-8 w-full justify-center items-center">
        <div className="relative w-[100px] h-[100px] md:w-[175px] md:h-[175px]  lg:w-[250px] lg:h-[250px]">
          <Image
            src={userData?.pfp || ""}
            alt="User profile picture"
            fill
            className="rounded-full object-cover"
          />
        </div>
        <div className="flex flex-col items-center gap-3">
          <h1 className="font-semibold text-xl lg:text-2xl text-center">
            {userData?.user}
          </h1>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="font-semibold">{postNumber}</span>
              <span className="text-sm">Posts</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-semibold">{followersNumber}</span>
              <span className="text-sm">Followers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-semibold">{followedNumber}</span>
              <span className="text-sm">Following</span>
            </div>
          </div>
          <p className="hidden lg:block text-center lg:text-left text-sm lg:text-base py-2 lg:max-w-[500px] max-h-[150px] overflow-y-auto">
            {userData?.desc}
          </p>
        </div>
      </div>
      <p className="block lg:hidden text-center text-sm py-2 max-h-[150px] overflow-y-auto">
        {userData?.desc}
      </p>
      <div className="w-full border border-accent-foreground" />
      <UserPosts />
    </main>
  );
};
