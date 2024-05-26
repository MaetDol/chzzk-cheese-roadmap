import { Text } from '@/components/Text';

export function Heading(level: 1 | 2 | 3 | 4, text: string) {
  const heading = document.createElement(`h${level}`);
  heading.append(Text(text, { useChzzkFont: true, size: 'initial' }));

  return heading;
}
