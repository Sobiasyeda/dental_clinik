import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default ({ mode }) => {
  const isProduction = mode === "production";
  return defineConfig({
    plugins: [
      react({
        jsxRuntime: "automatic",
        babel: {
          plugins: [
            isProduction ? "babel-plugin-react-remove-properties" : null,
          ].filter(Boolean),
        },
      }),
    ],

    build: {
      outDir: "backend/static",
      emptyOutDir: true,
      rollupOptions: {
        output: {
          // Custom manual chunking logic
          manualChunks: {
            vendor: ["react", "react-dom"], // Split React libraries into a separate chunk
          },
        },
      },
      chunkSizeWarningLimit: 500,
    },
    base: mode === "production" ? "/static/" : "/",
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        isProduction ? "production" : "development",
      ),
      "process.env.REACT_PROFILING": JSON.stringify(
        isProduction ? "true" : "false",
      ),
    },
  });
};
