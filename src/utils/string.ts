export function kebabToCamel(str: string) {
  return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}
