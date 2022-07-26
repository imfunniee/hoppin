import "../styles/globals.scss";
import type { AppProps } from "next/app";
import { useEffect } from "react";

import { hop } from "@onehop/client";
import { Toaster } from "react-hot-toast";

import "remixicon/fonts/remixicon.css";

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (!(typeof window === "undefined")) {
      hop.init({
        projectId: process.env.PROJECT_ID as string,
      });
    }
  }, []);
  return (
    <>
      <Component {...pageProps} />
      <Toaster position="top-center" />
    </>
  );
}

export default MyApp;
