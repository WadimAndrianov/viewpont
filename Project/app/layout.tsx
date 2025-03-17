import "bootstrap/dist/css/bootstrap.css";
import BootstrapClient from "./components/BootstrapClient";
import { MainHeader } from "./components/MainHeader";

import type { Metadata } from "next";
import SessionProviderWrapper from "./components/SessionProviderWrapper";

export const metadata: Metadata = {
  title: "ViewPoint",
  description: "An application for posting your reviews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>
          <MainHeader />
          {children}
          <BootstrapClient />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
