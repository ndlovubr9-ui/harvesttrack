export const STATUS_OPTIONS = [
  "New Contact",
  "Studying",
  "Preparing for Baptism",
  "Baptized",
];

export function statusProgress(status: string): number {
  const index = STATUS_OPTIONS.indexOf(status);
  if (index === -1) return 0;
  return ((index + 1) / STATUS_OPTIONS.length) * 100;
}