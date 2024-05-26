export function Text(
  text: string,
  { useChzzkFont, size }: { useChzzkFont?: boolean; size?: string } = {},
) {
  const span = document.createElement('span');
  span.innerText = text;
  span.style.fontFamily = `${useChzzkFont ? 'Sandoll' : ''} Nemony2`;
  span.style.color = '#444';
  span.style.fontSize = size ?? '18px';

  return span;
}
