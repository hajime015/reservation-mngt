// Lightweight auth stub.
// The original app used Firebase only for an optional Google Sign-In popup.
// This build runs entirely on local browser storage; Google Sign-In is not
// configured, so users sign in via the Local Admin or Staff portals instead.

export const auth = {
  async signOut() {
    /* no-op: no remote session to clear */
  },
};

export const googleProvider = {};

export async function signInWithPopup(): Promise<never> {
  const err = new Error(
    "Google Sign-In is not configured in this build. Please use the Local Admin or Staff login.",
  );
  throw err;
}
