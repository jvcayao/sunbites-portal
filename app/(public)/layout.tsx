import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sunbites",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
