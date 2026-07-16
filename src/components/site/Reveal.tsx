import { useEffect, useRef, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "header" | "footer" | "li";
}

export function Reveal({ children, delay = 0, className = "", as = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const target = e.target;
            if (target instanceof HTMLElement) {
              target.style.transitionDelay = `${delay}ms`;
              target.classList.add("in");
              io.unobserve(target);
            }
          }
        });
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  const setRef = (node: HTMLElement | null) => {
    ref.current = node;
  };
  const props = { ref: setRef, className: `reveal ${className}` };

  switch (as) {
    case "section":
      return <section {...props}>{children}</section>;
    case "article":
      return <article {...props}>{children}</article>;
    case "header":
      return <header {...props}>{children}</header>;
    case "footer":
      return <footer {...props}>{children}</footer>;
    case "li":
      return <li {...props}>{children}</li>;
    default:
      return <div {...props}>{children}</div>;
  }
}
