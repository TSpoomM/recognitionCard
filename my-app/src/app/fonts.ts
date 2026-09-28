import localFont from "next/font/local";

// Plain @font-face + url("/fonts/...") in globals.css resolves against the
// domain root, not this app's basePath (/recognitioncard) - same class of
// bug as the logo image. next/font/local bundles these as build assets and
// gets the basePath-correct URL right automatically, so use it instead of
// raw CSS @font-face.
export const ibmPlexSansThai = localFont({
  src: [
    { path: "../public/fonts/IBMPlexSansThai-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/IBMPlexSansThai-Medium.ttf", weight: "500 600", style: "normal" },
    { path: "../public/fonts/IBMPlexSansThai-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-ibm-plex-sans-thai",
  display: "swap",
});

export const roboto = localFont({
  src: [
    { path: "../public/fonts/Roboto-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/Roboto-Medium.ttf", weight: "500 700", style: "normal" },
  ],
  variable: "--font-roboto",
  display: "swap",
});
