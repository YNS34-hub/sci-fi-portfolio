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
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto");
  const protocol =
    forwardedProtocol ?? (host?.startsWith("localhost") ? "http" : "https");
  const metadataBase = host ? new URL(`${protocol}://${host}`) : undefined;
  const imageUrl = metadataBase
    ? new URL("/og.png", metadataBase).toString()
    : "/og.png";

  return {
    metadataBase,
    title: "无主星图｜有些世界，不需要被抵达",
    description:
      "三颗虚构行星、九幅电影镜头与一份由你生成的非接触公约。关于探索、命名与克制的交互式科幻作品。",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "无主星图",
      description: "有些世界，不需要被抵达。",
      type: "website",
      locale: "zh_CN",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: "无主星图" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "无主星图",
      description: "有些世界，不需要被抵达。",
      images: [imageUrl],
    },
  };
}

const directionContract = `<!--
THESIS: 发现创造义务；拒绝通用发光星图，把克制本身变成主要交互。
OWN-WORLD: 近黑暗房、摄影骨白、钴蓝、硒红和硫黄；玻璃底片、穿孔、银盐接触印样、油性铅笔。
STORY: 访客显影三颗世界，阅读九次观察，选择观察、命名或接触，最后生成本地非接触公约。
FIRST VIEWPORT: 左侧巨型竖向钩子，右侧三格横向电影底片；光谱尺沿底边拖动，首要动作是开始观察。
FORM: radio telescope spectral plate archive，第 6 个候选；正视暗房工作台，seed 54ade506。
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

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
        <div
          className="direction-contract"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: directionContract }}
        />
        {children}
      </body>
    </html>
  );
}
