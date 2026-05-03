export const emptyFor = (fields = []) =>
  Object.fromEntries(fields.map((f) => [f, ""]));

export function labelize(s = "") {
  return String(s).replaceAll("-", " ").replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase());
}
