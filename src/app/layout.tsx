import type { Metadata } from "next";
import "./globals.css";
import StyledComponentsRegistry from "@/lib/registry";
import { ThemeProvider } from "@/lib/themeContext";
import { getSite } from "@/lib/site";
import { getMetadata } from "@/lib/metadata";
import { ThemeSyncedToaster } from "@/components/themeSyncedToaster";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return getMetadata(site);
}

// Applied before React hydrates to prevent a flash of the wrong theme
const themeInitScript = `
  (function() {
    try {
      var stored = localStorage.getItem('theme');
      if (stored === 'dark' || stored === 'light') {
        document.documentElement.setAttribute('data-theme', stored);
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <StyledComponentsRegistry>
          <ThemeProvider>
            <ThemeSyncedToaster />
            {children}
          </ThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
