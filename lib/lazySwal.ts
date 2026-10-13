/**
 * Lazy loader for sweetalert2 so the library is fetched only when a dialog
 * is actually shown, keeping it out of route bundles.
 */
export const getSwal = async () => (await import("sweetalert2")).default;
