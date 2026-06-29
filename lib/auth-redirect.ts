const DEFAULT_AUTH_REDIRECT_PATH = "/dashboard";
const SAME_ORIGIN_PATH_PATTERN = /^\/(?![\/\\])/;

export function getSafeAuthRedirectUrl(requestUrl: string, nextPath: string | null) {
  const requestOrigin = new URL(requestUrl).origin;
  const fallbackUrl = new URL(DEFAULT_AUTH_REDIRECT_PATH, requestOrigin);

  if (!nextPath || !SAME_ORIGIN_PATH_PATTERN.test(nextPath)) {
    return fallbackUrl;
  }

  try {
    const redirectUrl = new URL(nextPath, requestOrigin);
    return redirectUrl.origin === requestOrigin ? redirectUrl : fallbackUrl;
  } catch {
    return fallbackUrl;
  }
}
