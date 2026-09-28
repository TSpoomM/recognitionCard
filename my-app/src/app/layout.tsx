import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import "./globals.css";
import { isDevAuthBypassEnabled } from "../lib/auth/devAuth";
import { getHrkpisSessionCookieName, readHrkpisSession } from "../lib/auth/hrkpisSession";
import SessionWatcher from "../components/providers/SessionWatcher";
import { ibmPlexSansThai, roboto } from "./fonts";

export const metadata: Metadata = {
  title: "Recognition Cards",
  description: "Created for complimenting and recognizing.",
};

const HRKPIS_LOGIN_PATH = process.env.HRKPIS_LOGIN_URL || "/hrkpis/index.php";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(getHrkpisSessionCookieName())?.value;
  const session = await readHrkpisSession(sessionId);

  if (!session && !isDevAuthBypassEnabled) {
    // Must be an absolute URL: redirect() auto-prefixes relative paths with
    // basePath, which would wrongly turn /hrkpis/index.php into /recognitioncard/hrkpis/index.php.
    if (/^https?:\/\//.test(HRKPIS_LOGIN_PATH)) {
      redirect(HRKPIS_LOGIN_PATH);
    }
    const headerList = await headers();
    const host = headerList.get("host");
    const protocol = headerList.get("x-forwarded-proto") || "http";
    redirect(`${protocol}://${host}${HRKPIS_LOGIN_PATH}`);
  }

  return (
    <html lang="en" className={`h-full antialiased ${ibmPlexSansThai.variable} ${roboto.variable}`}>
      <body className="min-h-full flex flex-col font-sans">
        <SessionWatcher />
        {children}
      </body>
    </html>
  );
}
