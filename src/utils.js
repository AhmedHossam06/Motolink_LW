// Only letters (Arabic/English) and spaces — no symbols/digits
export const NAME_REGEX = /^[a-zA-Z\u0600-\u06FF\s]*$/;

export function getPasswordStrength(password) {
  if (!password) return { label: "", score: 0, color: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { label: "Weak", score, color: "bg-red-500" };
  if (score <= 3) return { label: "Medium", score, color: "bg-amber-500" };
  return { label: "Strong", score, color: "bg-emerald-500" };
}