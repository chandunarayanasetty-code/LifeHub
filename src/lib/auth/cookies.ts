/**
 * The session cookie name.
 *
 * This lives in its own module with no server-only imports so the request
 * proxy (which runs before the app) can read the same name as the auth layer.
 */
export const SESSION_COOKIE = "lifehub_session";
