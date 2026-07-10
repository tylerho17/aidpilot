import createNextIntlPlugin from "next-intl/plugin";

// Point next-intl at our request config (no i18n URL routing).
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withNextIntl(nextConfig);
