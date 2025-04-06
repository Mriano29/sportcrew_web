//Core
import React from "react";

//Elements
import Image from "next/image";

export const DashboardLogo = () => {
  return (
    <div className="h-16 pr-5 flex items-center border-b border-accent-foreground">
      <Image
        className="object-contain"
        src="/images/SportCrewLogoTitle.png"
        width={240}
        height={0}
        alt="SportCrew Logo"
      />
    </div>
  );
};