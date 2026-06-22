export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/auth/login", "/auth/signup", "/vault"],
      disallow: ["/dashboard", "/dashboard/*", "/admin", "/api/*"],
    },
    sitemap: "https://trustvault.com/sitemap.xml",
  };
}
