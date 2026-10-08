// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: {
    preset: "vercel",
    output: {
      dir: ".vercel/output",
      serverDir: ".vercel/output/functions/__server.func",
      publicDir: ".vercel/output/static",
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      {
        name: "api-dev-middleware",
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (!req.url) return next();

            if (req.url.startsWith("/api/availability") && req.method === "GET") {
              try {
                const { default: availabilityHandler } = await import("./api/availability.ts");
                const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
                const webReq = new Request(url.toString(), {
                  method: "GET",
                  headers: req.headers as HeadersInit,
                });
                const response = await availabilityHandler(webReq, res);
                if (!res.writableEnded) {
                  res.statusCode = response.status;
                  response.headers.forEach((value, key) => {
                    res.setHeader(key, value);
                  });
                  const body = await response.text();
                  res.end(body);
                }
                return;
              } catch (err) {
                next(err);
                return;
              }
            }

            if (req.url.startsWith("/api/create-checkout-session") && req.method === "POST") {
              try {
                const { default: checkoutHandler } = await import("./api/create-checkout-session.ts");
                let rawBody = "";
                for await (const chunk of req) {
                  rawBody += chunk;
                }
                const parsedBody = rawBody ? JSON.parse(rawBody) : {};
                const fakeReq = {
                  method: "POST",
                  url: req.url,
                  headers: req.headers,
                  body: parsedBody,
                  json: async () => parsedBody,
                };
                const response = await checkoutHandler(fakeReq as any, res);
                if (!res.writableEnded) {
                  res.statusCode = response.status;
                  response.headers.forEach((value, key) => {
                    res.setHeader(key, value);
                  });
                  const body = await response.text();
                  res.end(body);
                }
                return;
              } catch (err) {
                next(err);
                return;
              }
            }

            if (req.url.startsWith("/api/booking") && req.method === "POST") {
              try {
                const { default: bookingHandler } = await import("./api/booking.ts");
                let rawBody = "";
                for await (const chunk of req) {
                  rawBody += chunk;
                }
                const parsedBody = rawBody ? JSON.parse(rawBody) : {};
                const fakeReq = {
                  method: "POST",
                  url: req.url,
                  headers: req.headers,
                  body: parsedBody,
                  json: async () => parsedBody,
                };
                const response = await bookingHandler(fakeReq as any, res);
                if (!res.writableEnded) {
                  res.statusCode = response.status;
                  response.headers.forEach((value, key) => {
                    res.setHeader(key, value);
                  });
                  const body = await response.text();
                  res.end(body);
                }
                return;
              } catch (err) {
                next(err);
                return;
              }
            }

            next();
          });
        },
      },
    ],
  },
});
