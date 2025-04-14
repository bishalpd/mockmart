import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { APP_NAME, APP_DESCRIPTION, SERVER_URL } from "@/lib/constants";
import { ThemeProvider } from "next-themes";
import "@/assets/styles/globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    template: "%s | MockMart",
    default: APP_NAME,
  },
  description: `${APP_DESCRIPTION}`,
  metadataBase: new URL(SERVER_URL),
};

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={nunito.className}>
        <ThemeProvider defaultTheme="light" enableSystem attribute={"class"} disableTransitionOnChange>
          {children}
          <Toaster richColors={true} />
        </ThemeProvider>
      </body>
    </html>
  );
}
