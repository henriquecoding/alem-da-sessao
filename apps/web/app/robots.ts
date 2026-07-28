import type { MetadataRoute } from "next";
import { publicLaunchIsEnabled } from "@/lib/runtime";

export default function robots(): MetadataRoute.Robots {
  if (publicLaunchIsEnabled()) {
    return {
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://alemdasessao.com/sitemap.xml",
      host: "https://alemdasessao.com",
    };
  }

  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
