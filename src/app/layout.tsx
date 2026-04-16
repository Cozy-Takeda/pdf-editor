import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF Editor",
  description: "ブラウザ上でPDFを編集できるWebアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
