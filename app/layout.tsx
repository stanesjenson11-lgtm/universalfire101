import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { site } from "@/lib/content";
import Nav from "@/components/chrome/Nav";
import Footer from "@/components/chrome/Footer";
import SmoothScroll from "@/components/chrome/SmoothScroll";
import "./globals.css";

/* Apple devices render SF (the system face) — Apple's font licence keeps SF
   off the web, so it is never shipped. Everyone else gets Inter, the closest
   match, which also carries the wght axis the variable-font effects drive. */
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${site.short}` },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  // Zoom stays available (WCAG 1.4.4) — no maximumScale.
  initialScale: 1,
};

/* One business, two branches. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      name: site.name,
      alternateName: site.short,
      url: site.url,
    },
    ...site.offices.map((o) => ({
      "@type": "LocalBusiness",
      "@id": `${site.url}/#${o.city.toLowerCase()}`,
      name: `${site.name} — ${o.city}`,
      url: site.url,
      image: `${site.url}/opengraph-image.png`,
      telephone: [site.phone.tel, site.phone2.tel],
      email: site.email,
      description: site.description,
      address: {
        "@type": "PostalAddress",
        streetAddress: o.street,
        addressLocality: o.city,
        postalCode: o.postcode,
        addressRegion: "Tamil Nadu",
        addressCountry: "IN",
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "00:00",
        closes: "23:59",
      },
      areaServed: "Tamil Nadu",
      sameAs: [site.facebook, site.instagram],
    })),
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={inter.variable}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[var(--z-loader)] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:text-ink"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
