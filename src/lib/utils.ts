export const checkKey = (
  e: KeyboardEvent,
  key: string,
  ...modifiers: ("ctrlKey" | "metaKey" | "altKey" | "shiftKey")[]
): boolean => {
  if (e.key !== key && e.code !== key) return false;

  for (const mod of ["ctrlKey", "metaKey", "altKey", "shiftKey"] as const) {
    if (modifiers.includes(mod) && e[mod]) continue;
    if (e[mod]) return false;
  }
  return true;
};

export const wrap = (num: number, min: number, max: number) => {
  const range = max - min + 1;
  return ((((num - min) % range) + range) % range) + min;
};
