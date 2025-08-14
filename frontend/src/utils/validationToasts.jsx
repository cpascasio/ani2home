import { toast } from "react-hot-toast";

/**
 * Build a concise human-friendly list of Joi error messages.
 * - de-dupes identical messages
 * - shows up to `maxLines` items, then a "+N more" tail
 */
export function summarizeJoiDetails(details = [], maxLines = 4) {
  const messages = (details || [])
    .map((d) => d?.message)
    .filter(Boolean);

  const unique = [...new Set(messages)];
  const lines = unique.slice(0, maxLines);
  const more = Math.max(0, unique.length - lines.length);
  return { lines, more };
}

/**
 * Show a rich toast with bullet points for validation errors.
 * Pass the raw `details` array you return from the backend on 400.
 */
export function showValidationToast(details = [], title = "Validation failed") {
  const { lines, more } = summarizeJoiDetails(details);
  toast.error(
    <div>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>
      <ul style={{ marginLeft: 16 }}>
        {lines.map((m, i) => (
          <li key={i} style={{ lineHeight: 1.3 }}>{m}</li>
        ))}
      </ul>
      {more > 0 && (
        <div style={{ marginTop: 4, opacity: 0.7 }}>+{more} more error(s)</div>
      )}
    </div>,
    { duration: 6000 }
  );
}
