export function Text(text: string, useChzzkFont?: boolean) {
  const span = document.createElement('span');
  span.innerText = text;
  span.style.fontFamily = `${useChzzkFont ? 'Sandoll' : ''} Nemony2`;
  span.style.color = '#444';

  return span;
}
