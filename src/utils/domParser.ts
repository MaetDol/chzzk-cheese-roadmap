const parser = new DOMParser();
export function parseHtml(html: string) {
  return parser.parseFromString(html, 'text/html').body.children[0];
}
