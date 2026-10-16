// Shared component styles for every demo so we never waste stage time on CSS.
export const demoStyles = `
  :host { display:block; max-width:560px; margin:0 auto; font-family:system-ui, sans-serif; }
  form { display:grid; gap:14px; }
  label { display:grid; gap:4px; font-weight:600; font-size:14px; }
  input, select { font:inherit; padding:10px 12px; border:1.5px solid #c9ced6; border-radius:8px; }
  input:focus, select:focus { outline:2px solid #4285F4; border-color:transparent; }
  .error { color:#d93025; font-size:13px; font-weight:500; }
  .hint  { color:#5f6368; font-size:13px; font-weight:500; }
  .ok    { color:#188038; font-size:13px; font-weight:500; }
  button { font:inherit; font-weight:600; padding:10px 16px; border:0; border-radius:8px; background:#4285F4; color:#fff; cursor:pointer; }
  button:disabled { background:#aab4c3; cursor:not-allowed; }
  pre { background:#202124; color:#e8eaed; padding:12px; border-radius:8px; font-size:13px; overflow:auto; }
  .row { display:flex; gap:12px; align-items:center; }
`;
