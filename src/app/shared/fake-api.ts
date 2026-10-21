// A pretend backend, so the demos work without an internet connection.
// Both functions add a short delay to behave like a real network call.

// Usernames that are already "taken" on our fake server.
const TAKEN = ['faith', 'admin', 'gdg', 'soweto', 'angular'];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Resolves true if the username is free. The 800ms delay makes the pending state visible. */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  await wait(800);
  return !TAKEN.includes(username.trim().toLowerCase());
}

/** Fake "register" endpoint. It rejects one specific email so we can show server-side errors. */
export async function registerAttendee(data: unknown): Promise<{ ok: true } | { ok: false; field: 'email'; message: string }> {
  await wait(1000);
  const email = (data as { email?: string }).email ?? '';
  if (email.toLowerCase() === 'taken@gdg.dev') {
    return { ok: false, field: 'email', message: 'This email already has a ticket' };
  }
  console.log('Registered:', data);
  return { ok: true };
}
