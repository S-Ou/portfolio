import type { Metadata } from "next";
import "./globals.css";
import StyledComponentsRegistry from "@/lib/registry";
import { getSite } from "@/lib/site";
import { getMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return getMetadata(site);
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
