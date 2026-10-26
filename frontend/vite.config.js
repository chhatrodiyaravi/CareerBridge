import path from "node:path"

import { fileURLToPath } from "node:url"

import react from "@vitejs/plugin-react"

import tailwindcss from "@tailwindcss/vite"

import { defineConfig } from "vite"

const frontendDirectory = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => ({
  base: process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/` : "/",

  build: {
    sourcemap: mode === "development" ? "inline" : false,

    minify: mode !== "development",
  },

  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(frontendDirectory, "src"),
    },
  },

  server: {
    host: process.env.HOST || "0.0.0.0",

    port: Number.parseInt(process.env.PORT || "8443", 10),

    strictPort: true,

    proxy: {
      "/api": {
        target: "http://localhost:5000",

        changeOrigin: true,
      },
    },
  },

  preview: {
    host: process.env.HOST || "0.0.0.0",

    port: Number.parseInt(process.env.PORT || "8443", 10),
  },
}))
