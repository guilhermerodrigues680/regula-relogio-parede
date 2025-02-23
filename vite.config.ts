import fs from "node:fs";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  ...(command === "serve" && {
    server: {
      // Como o uso da camera depende um ambiente seguro,
      // para desenvolvimento é necessário gerar certificados
      // locais e configurar o vite para usá-los.
      // https://vitejs.dev/config/server-options.html#server-https
      https: {
        key: fs.readFileSync("local-cert/key.pem"),
        cert: fs.readFileSync("local-cert/cert.pem"),
      },
      host: "0.0.0.0",
    },
  }),
}));
