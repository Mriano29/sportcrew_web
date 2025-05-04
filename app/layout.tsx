import { Manrope } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { ToastContainer } from "react-toastify";

/**
 * This is the base url used in the project
 */
const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

/**
 * Page metadata
 */
export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Sportcrew web",
  description: "Social place for sporty people",
};

/**
 * Font configuration
 */
const manrope = Manrope({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /**
     * This is the projects root layout, where the theme provider is defined,
     * note that hydration warnings are supressed, this project is entirely 
     * client side rendered so this is not a problem.
     * 
     * ToastContainer is a component used in every page so declaring it here
     * saves lines of code.
     */
    <html lang="en" className={manrope.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastContainer />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
