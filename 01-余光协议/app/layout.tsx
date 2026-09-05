import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const incomingHeaders = await headers();
  const host =
    incomingHeaders.get("x-forwarded-host") ??
    incomingHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    incomingHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  const title = "余光协议 | 互动科幻作品";
  const description =
    "一部关于集体记忆、责任与安慰的互动科幻作品。你将决定城市最后一次真实日落是否应该被遗忘。";

  return {
    metadataBase,
    title,
    description,
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      type: "website",
      locale: "zh_CN",
      title,
      description,
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: "余光协议，一部关于公共记忆与责任的互动科幻作品",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <span
          hidden
          data-direction-contract="6ec365a4"
          dangerouslySetInnerHTML={{
            __html: `<!--
THESIS: A city edits pain as infrastructure; the page refuses neon spectacle and generic card stacks.
OWN-WORLD: Iron-green civic surfaces, smoke-silver instruments, milk-white inspection panels, one physically sourced sunset-orange horizon.
STORY: The visitor sees the record, hears its witnesses, calibrates the cost, decides what remains, and writes a private memory receipt.
FIRST VIEWPORT: Off-center title at left, circular live-action aperture at right, one horizon control crossing both, primary action visible without scroll.
FORM: Solar-observatory horizon instrument, grounded direction six, horizon staging, seed key 6ec365a4.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
