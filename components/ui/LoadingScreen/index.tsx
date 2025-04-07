//Core
import React from "react";

//Elements
import Image from "next/image";

export const LoadingScreen = () => {
  return (
    <div className="h-screen w-full flex flex-row items-center justify-center">
      <Image
        className="object-contain animate-spin"
        src="/images/sportcrewlogo.png"
        width={100}
        height={100}
        alt="SportCrew Logo"
      />
    </div>
  );
};
