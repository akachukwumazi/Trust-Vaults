import "./globals.css";
import { ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
  title: "TrustVault",
  description: "Secure shared crypto savings built on trust between partners",
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
  
