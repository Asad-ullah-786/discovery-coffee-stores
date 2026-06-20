import "@/styles/globals.css";
import { StoreProvider } from "@/store/store-context";

export default function MyApp({ Component, pageProps }) {
  return (
    <StoreProvider>
      <Component {...pageProps} />
    </StoreProvider>
  );
}