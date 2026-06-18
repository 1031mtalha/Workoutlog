import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// If you deploy to GitHub Pages at https://USERNAME.github.io/REPO-NAME/
// uncomment the next line and set base to "/REPO-NAME/".
// On Vercel or Netlify you do NOT need a base — leave it default "/".
export default defineConfig({
  plugins: [react()],
  // base: "/fitness-tracker/",
});
