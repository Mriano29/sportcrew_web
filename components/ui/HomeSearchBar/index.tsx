import React, { useState, useRef, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { supabase } from "@/lib/client";

interface User {
  id: string;
  user: string;
  pfp: string;
  isFollowed: boolean;
}

export function HomeSearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleSearchClick = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setShowDropdown(true);

    const { data: userData, error } = await supabase
      .from("users")
      .select("id, user, pfp")
      .ilike("user", `%${searchTerm}%`);

    if (error) {
      console.error("Error fetching search results:", error.message);
      setLoading(false);
      return;
    }

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error("error");
      setLoading(false);
      return;
    }

    const currentUser = sessionData?.session?.user;

    const { data: followedUsers, error: followError } = await supabase
      .from("followed")
      .select("followedUser")
      .eq("user", currentUser?.id);

    if (followError) {
      console.error("Error fetching follows:", followError.message);
      setLoading(false);
      return;
    }

    const followedIds = new Set(followedUsers?.map((f) => f.followedUser));

    const resultsWithFollowed = (userData as User[]).map((user) => ({
      ...user,
      isFollowed: followedIds.has(user.id),
    }));

    setResults(resultsWithFollowed);
    setLoading(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFollowUser = async (targetUser: User) => {
    const currentUser = (await supabase.auth.getUser()).data.user;
    if (!currentUser) return;

    if (targetUser.isFollowed) {
      const { error: unfollowError } = await supabase
        .from("followed")
        .delete()
        .match({
          user: currentUser.id,
          followedUser: targetUser.id,
        });

      const { error: removeFollowerError } = await supabase
        .from("followers")
        .delete()
        .match({
          user: targetUser.id,
          follower: currentUser.id,
        });

      if (unfollowError || removeFollowerError) {
        console.error(
          "Error unfollowing:",
          unfollowError?.message || removeFollowerError?.message
        );
        return;
      }

      setResults((prev) =>
        prev.map((user) =>
          user.id === targetUser.id ? { ...user, isFollowed: false } : user
        )
      );
    } else {
      const { error: followError } = await supabase.from("followed").insert({
        user: currentUser.id,
        followedUser: targetUser.id,
      });

      const { error: addFollowerError } = await supabase
        .from("followers")
        .insert({
          user: targetUser.id,
          follower: currentUser.id,
        });

      if (followError || addFollowerError) {
        console.error(
          "Error following:",
          followError?.message || addFollowerError?.message
        );
        return;
      }

      setResults((prev) =>
        prev.map((user) =>
          user.id === targetUser.id ? { ...user, isFollowed: true } : user
        )
      );
    }
  };

  return (
    <div className="w-full flex justify-center lg:justify-start">
      <div className="relative w-full max-w-md" ref={containerRef}>
        <div className="flex items-center border-2 rounded-xl p-2">
          <input
            type="text"
            placeholder="Search for a user"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full focus:outline-none bg-background"
            onFocus={() => setShowDropdown(true)}
          />
          <button
            onClick={handleSearchClick}
            className="p-1"
            disabled={loading}
          >
            <SearchIcon sx={{ fontSize: 28 }} />
          </button>
        </div>

        {showDropdown && (
          <div className="absolute left-0 right-0 mt-2 border-2 rounded-xl shadow z-10 border-border bg-background">
            {loading ? (
              <div className="p-2 text-sm">Loading...</div>
            ) : results.length > 0 ? (
              results.map((result) => (
                <div key={result.id} className="p-2 cursor-pointer">
                  <div className="flex items-center gap-2 p-2">
                    <div className="relative w-[25px] h-[25px]">
                      <img
                        src={result.pfp || ""}
                        alt="User profile picture"
                        className="rounded-full object-cover h-full w-full"
                      />
                    </div>
                    <span className="font-semibold">{result.user}</span>
                    <div className="ml-auto">
                      <button
                        className={`rounded-md px-2 py-1 text-sm ${
                          result.isFollowed
                            ? "bg-muted text-muted-foreground"
                            : "bg-accent text-white hover:bg-accent-foreground"
                        }`}
                        onClick={() => handleFollowUser(result)}
                      >
                        {result.isFollowed ? "Followed" : "Follow"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-2 text-sm">No results...</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
