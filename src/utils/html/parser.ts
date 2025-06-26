export function extractBodyContent(html: string) {
  const bodyMatch = html.match(/<body([^>]*)>([\s\S]*?)<\/body>/i);

  if (!bodyMatch) {
    return { attributes: "", inner: html };
  }

  const attrs = bodyMatch[1].trim();
  const inner = bodyMatch[2];

  return {
    attributes: attrs,
    inner,
  };
}

export function parseAttributes(attrString: string): Record<string, string> {
  const attrRegex = /([\w:-]+)(?:="([^"]*)")?/g;
  const attrs: Record<string, string> = {};
  let match;

  while ((match = attrRegex.exec(attrString))) {
    const [, key, value = ""] = match;
    attrs[key] = value;
  }

  return attrs;
}
