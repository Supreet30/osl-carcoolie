"use client";

import { useEffect, useRef } from "react";
import "swagger-ui-dist/swagger-ui.css";

export default function ApiDocsPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    let ui;

    import("swagger-ui-dist/swagger-ui-bundle.js").then(
      ({ default: SwaggerUIBundle }) => {
        if (!containerRef.current) return;
        ui = SwaggerUIBundle({
          url: "/api/openapi.json",
          domNode: containerRef.current,
          presets: [SwaggerUIBundle.presets.apis],
          layout: "BaseLayout",
        });
      }
    );

    return () => {
      ui = null;
    };
  }, []);

  return <div ref={containerRef} />;
}
