import { News } from "@/components/News";
import { HomeSearchBar } from "@/components/ui";
import React from "react";

export const HomePage = () => {
  return (
    <main className="h-full w-full flex flex-col px-2 py-3 lg:px-7 lg:py-5 gap-4">
      <div className="flex w-full justify-center lg:justify-start items-center">
        <HomeSearchBar />
      </div>
      <div className="w-full border border-accent-foreground" />
      <div className="flex flex-col w-full h-full mb-[52px]  overflow-y-auto lg:mb-0">
        <News />
      </div>
    </main>
  );
};
