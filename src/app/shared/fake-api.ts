// A pretend backend so the demo works offline (conference Wi-Fi is never reliable!)

const TAKEN = ['faith', 'admin', 'gdg', 'soweto', 'angular'];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Resolves true if the username is free. Takes ~800ms so the audience can SEE the pending state. */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  await wait(800);
  return !TAKEN.includes(username.trim().toLowerCase());
}

/** Fake "register" endpoint. Rejects one email to demo server-side errors. */
export async function registerAttendee(data: unknown): Promise<{ ok: true } | { ok: false; field: 'email'; message: string }> {
  await wait(1000);
  const email = (data as { email?: string }).email ?? '';
  if (email.toLowerCase() === 'taken@gdg.dev') {
    return { ok: false, field: 'email', message: 'This email already has a ticket 🎟️' };
  }
  console.log('✅ Registered:', data);
  return { ok: true };
}
