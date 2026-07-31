import { type AppType } from "next/app";
import localFont from "next/font/local";

import "~/styles/globals.css";

const inter = localFont({
  src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  variable: "--font-sans",
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <main className={`font-sans ${inter.variable}`}>
      <Component {...pageProps} />
    </main>
  );
};

export default MyApp;
