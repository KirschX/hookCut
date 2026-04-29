import type { Metadata } from "next";
import { Newsreader, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import "./globals.css";

const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HookCut — Contents to Ads",
  description: "콘텐츠를 넣으면 광고 소재가 바로 나옵니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${newsreader.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <div className="mobile-gate" aria-live="polite">
          <div className="eyebrow">HookCut</div>
          <h1>
            데스크톱에서 <em>열어주세요.</em>
          </h1>
          <p>
            HookCut은 광고 기획 워크플로우 도구로, 1024px 이상 화면에서
            사용하도록 설계되었습니다. 모바일 지원은 v1.1에서 제공됩니다.
          </p>
        </div>
        {children}
        <Toaster position="bottom-right" theme="light" richColors closeButton />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
