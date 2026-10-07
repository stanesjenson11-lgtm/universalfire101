import type { MetadataRoute } from "next";
import { site } from "@/lib/content";

export const dynamic = "force-static";

/** One page now; the product and service sheets live inside it. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${site.url}/`, priority: 1 }];
}
