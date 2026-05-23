import { PortalLayout } from "@/components/layouts/portal-layout";

export default function PortalGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalLayout>{children}</PortalLayout>;
}
