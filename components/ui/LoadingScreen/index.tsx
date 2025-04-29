//Core
import React from "react";

export const LoadingScreen = () => {
  return (
    <div className="h-screen w-full flex flex-row items-center justify-center">
      <img
        className="object-contain animate-spin"
        src="/images/sportcrewlogo.png"
        width={100}
        height={100}
        alt="SportCrew Logo"
      />
    </div>
  );
};
