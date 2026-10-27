import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// /api/og sengaja tidak diblokir: crawler WhatsApp/X perlu mengambil gambar preview.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
