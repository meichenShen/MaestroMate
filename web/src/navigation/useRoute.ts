import { useEffect, useState } from "react";
import { rememberLocation } from "./local-history";
import { parseRoute } from "./routes";
export function useRoute() {
  const [route, setRoute] = useState(() => {
    rememberLocation();
    return parseRoute(location.hash);
  });
  useEffect(() => {
    const sync = () => {
      rememberLocation();
      setRoute(parseRoute(location.hash));
    };
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  return route;
}
