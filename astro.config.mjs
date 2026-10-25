// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // Apex custom domain served from GitHub Pages — no `base` path needed.
  site: "https://taylr.sh",

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    starlight({
      title: "taylr",
      description:
        "taylr creates complete Swift apps and packages and keeps them up to date without overwriting your edits.",
      // Docs live under /docs/. The marketing landing at / is a plain Astro page.
      // Starlight owns every route it renders; its pages are authored under
      // src/content/docs/ and prefixed here.
      // Pre-launch: keep search engines from indexing the site. Remove at launch,
      // along with the same tag in Landing.astro and public/api/index.html.
      head: [
        { tag: "meta", attrs: { name: "robots", content: "noindex, nofollow" } },
      ],
      logo: {
        light: "./src/assets/logo-light.svg",
        dark: "./src/assets/logo-dark.svg",
        replacesTitle: false,
      },
      editLink: {
        baseUrl:
          "https://github.com/brightdigit/taylr.sh/edit/main/",
      },
      // The DocC API reference is mounted as a static subpath (public/api/),
      // outside Astro's routing. Link to it from the sidebar.
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Introduction", slug: "docs" },
            { label: "Installation", slug: "docs/getting-started/installation" },
            { label: "Quickstart", slug: "docs/getting-started/quickstart" },
          ],
        },
        {
          label: "taylr profile",
          items: [
            { label: "Overview", slug: "docs/cli/profile" },
            { label: "add", slug: "docs/cli/profile/add" },
            { label: "list", slug: "docs/cli/profile/list" },
            { label: "default", slug: "docs/cli/profile/default" },
            {
              label: "secrets",
              items: [
                { label: "Overview", slug: "docs/cli/profile/secrets" },
                { label: "share", slug: "docs/cli/profile/secrets/share" },
                { label: "set", slug: "docs/cli/profile/secrets/set" },
                { label: "renew-session", slug: "docs/cli/profile/secrets/renew-session" },
              ],
            },
            { label: "remove", slug: "docs/cli/profile/remove" },
          ],
        },
        {
          label: "taylr project",
          items: [
            { label: "Overview", slug: "docs/cli/project" },
            { label: "create", slug: "docs/cli/project/create" },
            { label: "generate", slug: "docs/cli/project/generate" },
            { label: "test", slug: "docs/cli/project/test" },
            { label: "lint", slug: "docs/cli/project/lint" },
            { label: "build", slug: "docs/cli/project/build" },
            { label: "clean", slug: "docs/cli/project/clean" },
            { label: "register", slug: "docs/cli/project/register" },
            { label: "certs", slug: "docs/cli/project/certs" },
            { label: "add-device", slug: "docs/cli/project/add-device" },
            { label: "beta", slug: "docs/cli/project/beta" },
            { label: "metadata", slug: "docs/cli/project/metadata" },
            { label: "privacy", slug: "docs/cli/project/privacy" },
            { label: "screenshots", slug: "docs/cli/project/screenshots" },
            { label: "validate", slug: "docs/cli/project/validate" },
          ],
        },
        {
          label: "taylr package",
          items: [
            { label: "Overview", slug: "docs/cli/package" },
            { label: "create", slug: "docs/cli/package/create" },
            { label: "test", slug: "docs/cli/package/test" },
            { label: "lint", slug: "docs/cli/package/lint" },
            { label: "build", slug: "docs/cli/package/build" },
            { label: "clean", slug: "docs/cli/package/clean" },
            { label: "validate", slug: "docs/cli/package/validate" },
          ],
        },
        {
          label: "Guides",
          items: [
            { label: "Set up CI secrets", slug: "docs/guides/ci-secrets" },
            { label: "Working with AI tools", slug: "docs/guides/ai" },
          ],
        },
        {
          label: "Reference",
          items: [
            { label: "What's in your project", slug: "docs/reference/project" },
            { label: "The manifest", slug: "docs/reference/manifest" },
          ],
        },
        {
          label: "API Reference (DocC)",
          link: "/api/",
          attrs: { target: "_blank" },
          badge: { text: "soon", variant: "caution" },
        },
      ],
      customCss: [
        "./src/styles/tailwind.css",
        "./src/styles/theme.css",
      ],
    }),
    sitemap(),
  ],
});
