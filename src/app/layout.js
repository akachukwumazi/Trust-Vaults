import "./globals.css";
import { ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
  metadataBase: new URL("https://trustvault.com"),
  title: "TrustVault",
  description: "Secure collaborative savings and vault management platform. Create vaults, invite members, track deposits, manage shared finances, and track activities in real time.",
  openGraph: {
    title: "TrustVault",
    description: "Secure collaborative savings and vault management platform. Create vaults, invite members, track deposits, manage shared finances, and track activities in real time.",
    url: "https://trustvault.com",
    siteName: "TrustVault",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "TrustVault - Save Together. Secure Together.",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrustVault",
    description: "Secure collaborative savings and vault management platform. Create vaults, invite members, track deposits, manage shared finances, and track activities in real time.",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
  
