export async function delay(ms: number) {
  return new Promise((rs) => setTimeout(rs, ms));
}
