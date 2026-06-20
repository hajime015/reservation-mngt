import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import App from "../kos/App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kitchen Order Dashboard" },
      {
        name: "description",
        content:
          "Premium kitchen ordering and inventory system. Load warehouse catalogs, draft orders with category filters, and export order manifests.",
      },
      { property: "og:title", content: "Kitchen Order Dashboard" },
      {
        property: "og:description",
        content:
          "Premium kitchen ordering and inventory system for warehouse catalogs and order manifests.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  // App uses localStorage at init — render only on client to avoid SSR mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <App />;
}
