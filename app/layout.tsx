import type { Metadata } from "next";
import { Toaster } from "sonner";

import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sunbites Portal",
  description: "Sunbites Kitchen Parent Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <body>
        <Providers>
          {children}
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
