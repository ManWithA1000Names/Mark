export const checkKey = (
  e: KeyboardEvent,
  key: string,
  ...modifiers: ("ctrlKey" | "metaKey" | "altKey" | "shiftKey")[]
): boolean => {
  if (e.key !== key && e.code !== key) return false;

  let is_good = true;
  is_good &&= modifiers.includes("ctrlKey") ? e.ctrlKey : !e.ctrlKey;
  is_good &&= modifiers.includes("metaKey") ? e.metaKey : !e.metaKey;
  is_good &&= modifiers.includes("altKey") ? e.altKey : !e.altKey;
  is_good &&= modifiers.includes("shiftKey") ? e.shiftKey : !e.shiftKey;

  return is_good;
};

export const wrap = (num: number, min: number, max: number) => {
  const range = max - min + 1;
  return ((((num - min) % range) + range) % range) + min;
};
