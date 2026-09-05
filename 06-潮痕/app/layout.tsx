import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "潮痕 · THE WATERLINE";
const description =
  "一部由六章主镜头与六件证物影像组成的互动潮汐档案：城市把被删除的记忆封存在海底，退潮那天，她在档案里找到了自己。";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = (
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000"
  )
    .split(",")[0]
    .trim();
  const forwardedProtocol = requestHeaders
    .get("x-forwarded-proto")
    ?.split(",")[0]
    .trim();
  const protocol =
    forwardedProtocol ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const socialImage = new URL("/og.png", origin).toString();

  return {
    title,
    description,
    applicationName: "潮痕 · THE WATERLINE",
    keywords: ["潮痕", "电影静帧", "互动叙事", "视觉档案", "THE WATERLINE"],
    icons: {
      icon: [{ url: "/favicon.png", type: "image/png", sizes: "96x96" }],
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "zh_CN",
      siteName: title,
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: "《潮痕》：一道盐线穿过空档案潜水服，水下映出倒置的城市。",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
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
      <body>{children}</body>
    </html>
  );
}
