import { parseHtml } from '@/utils/domParser';
import { IconProps } from "./types";

export function MissionDonation({ color, height, width }: IconProps) {
  const icon = parseHtml(
    `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M27.2 15.9998C27.2 22.1854 22.1856 27.1998 16 27.1998C9.8144 27.1998 4.79999 22.1854 4.79999 15.9998C4.79999 9.81422 9.8144 4.7998 16 4.7998" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"></path><path d="M22.4 16.0001C22.4 19.5347 19.5346 22.4001 16 22.4001C12.4654 22.4001 9.59998 19.5347 9.59998 16.0001C9.59998 12.4655 12.4654 9.6001 16 9.6001" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"></path><path d="M15.53 14.3737C15.0736 14.8542 15.093 15.6137 15.5735 16.0702C16.054 16.5267 16.8136 16.5072 17.27 16.0267L15.53 14.3737ZM17.27 16.0267L24.87 8.02669L23.13 6.3737L15.53 14.3737L17.27 16.0267Z" fill="currentColor"></path><path d="M20.4938 5.99561L21.6959 9.60157C21.7437 9.74492 21.8561 9.8574 21.9995 9.90516L25.6043 11.1063C25.7768 11.1638 25.9669 11.1189 26.0955 10.9903L29.3212 7.76453C29.6009 7.48482 29.4412 7.00585 29.0496 6.94994L25.5564 6.45118C25.3452 6.42103 25.1793 6.25508 25.1491 6.04388L24.6501 2.55042C24.5941 2.15886 24.1152 1.9992 23.8355 2.27888L20.6098 5.50439C20.4812 5.63295 20.4363 5.82312 20.4938 5.99561Z" fill="currentColor"></path></svg>`
  ) as SVGAElement;
  if (width) icon.style.width = width;
  if (height) icon.style.height = height;
  if (color) icon.style.color = color;
  return icon;
}
