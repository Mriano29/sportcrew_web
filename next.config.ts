import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hilscausqnrdyzxuyrkk.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  //output: "export", //Uncomment to build
};

export default nextConfig;
