import type { AnchorHTMLAttributes } from "react";
import { backToParent } from "./local-history";
export function BackLink({
  href,
  children,
  ...rest
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string }) {
  return (
    <a
      {...rest}
      href={href}
      onClick={(e) => {
        if (
          e.button === 0 &&
          !e.metaKey &&
          !e.ctrlKey &&
          !e.shiftKey &&
          !e.altKey
        ) {
          e.preventDefault();
          backToParent(href);
        }
      }}
    >
      {children}
    </a>
  );
}
