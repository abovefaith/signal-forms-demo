// A fake server, so the demos work offline.
// Each call waits a moment, like a real network request.

// Usernames that are already taken.
const TAKEN = ['faith', 'admin', 'gdg', 'soweto', 'angular'];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Returns true if the username is free. Takes 800ms so the "checking" message is visible. */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  await wait(800);
  return !TAKEN.includes(username.trim().toLowerCase());
}

/** Registers an attendee. The email taken@gdg.dev always fails, to show a server error. */
export async function registerAttendee(data: unknown): Promise<{ ok: true } | { ok: false; field: 'email'; message: string }> {
  await wait(1000);
  const email = (data as { email?: string }).email ?? '';
  if (email.toLowerCase() === 'taken@gdg.dev') {
    return { ok: false, field: 'email', message: 'This email already has a ticket' };
  }
  console.log('Registered:', data);
  return { ok: true };
}
