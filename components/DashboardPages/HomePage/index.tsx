import { HomeSearchBar } from "@/components/ui";
import React from "react";


export const HomePage = () => {

  return (
    <main className="h-full w-full flex flex-col px-2 py-3 lg:px-7 lg:py-5 gap-4">
      <div className="flex w-full justify-center lg:justify-start items-center">
        <HomeSearchBar />
      </div>
      <div className="w-full border border-accent-foreground" />
      <div>
        <h1 className="text-2xl font-bold text-center">
          Welcome to the Home Page!
        </h1>
        <p className="text-center">
          This is where you can find the latest updates and news.
        </p>
      </div>
    </main>
  );
};
