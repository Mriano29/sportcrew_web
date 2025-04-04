//Core
import React from "react";

//Elements
import { MainContainer } from "../MainContainer";
import Image from "next/image";

export const LoadingScreen = () => {
  return (
    <MainContainer>
      <Image
        className="object-contain animate-spin"
        src="/images/sportcrewlogo.png"
        width={100}
        height={100}
        alt="SportCrew Logo"
      />
    </MainContainer>
  );
};
