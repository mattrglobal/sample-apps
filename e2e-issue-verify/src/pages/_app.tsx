import { type AppType } from "next/app";
import { api } from "@/utils/api";
import "@/styles/globals.css";
import { ThemeProvider } from "@material-tailwind/react";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
};

export default api.withTRPC(MyApp);
