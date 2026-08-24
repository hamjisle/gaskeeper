import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  other: { "codex-preview": "development" },
  metadataBase: new URL("https://gas-safety-hero.glodmtbloodsee.chatgpt.site"),
  title: "가스키퍼: 누출의 심연 — 180초 골든타임",
  description: "탐지·차단·자연환기·대피·신고 행동으로 가스사고를 해결하는 초·중·고 맞춤형 180초 체험 RPG",
  openGraph: {
    title: "가스키퍼: 누출의 심연 — 180초 골든타임",
    description: "안전 행동이 전투 기술이 되는 2~3분 가스사고 대응 RPG",
    type: "website",
    locale: "ko_KR",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "가스키퍼: 누출의 심연" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "가스키퍼: 누출의 심연 — 180초 골든타임",
    description: "무작위 사고·연령별 판단·자동 임무분석을 결합한 행동형 가스안전 RPG",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
