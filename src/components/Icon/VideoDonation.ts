import { parseHtml } from '@/utils/domParser';
import { IconProps } from "./types";

export function VideoDonation({ color, height, width }: IconProps) {
  const icon = parseHtml(`
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.03369 3.84058C5.10957 3.84058 2.73911 6.21105 2.73911 9.13516V21.634C2.73911 24.5581 5.10956 26.9286 8.03368 26.9286H12.2091C12.2713 26.9385 12.335 26.9437 12.4 26.9437C13.0628 26.9437 13.6 26.4064 13.6 25.7437C13.6 25.102 13.0963 24.5779 12.4627 24.5453V24.5286H8.03368C6.43505 24.5286 5.13911 23.2326 5.13911 21.634V9.13516C5.13911 7.53653 6.43505 6.24058 8.03369 6.24058H24.0223C25.6209 6.24058 26.9169 7.53652 26.9169 9.13516V21.272H26.9311C26.929 21.3008 26.928 21.33 26.928 21.3593C26.928 22.0221 27.4652 22.5593 28.128 22.5593C28.7907 22.5593 29.328 22.0221 29.328 21.3593C29.328 21.3038 29.3242 21.2491 29.3169 21.1956V9.13516C29.3169 6.21104 26.9464 3.84058 24.0223 3.84058H8.03369Z" fill="currentColor"></path><path d="M19.3084 14.7334C19.6322 14.9259 19.6322 15.4072 19.3084 15.5998L13.4798 19.0654C13.156 19.258 12.7513 19.0173 12.7513 18.6322L12.7513 11.7009C12.7513 11.3158 13.156 11.0752 13.4798 11.2677L19.3084 14.7334Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M22.2529 27.6889C22.8429 27.5652 23.3478 27.3397 23.7489 27.0195C24.3975 26.5016 24.7393 25.7625 24.7393 24.9136C24.7393 24.1045 24.4024 23.5174 23.9104 23.09C23.436 22.6778 22.8226 22.4179 22.2622 22.2172C22.0547 22.1429 21.8589 22.0777 21.6751 22.0166C21.3326 21.9027 21.032 21.8027 20.7758 21.6831C20.3696 21.4933 20.3153 21.3593 20.3153 21.2736C20.3153 21.0972 20.3828 20.9877 20.5184 20.9026C20.6771 20.8031 20.9446 20.7328 21.3265 20.7328C21.8042 20.7328 22.2494 20.8652 22.685 21.1265C23.1287 21.3926 23.7638 21.3753 24.1464 20.9202C24.5041 20.4949 24.4908 19.8117 23.989 19.4511C23.4943 19.0955 22.933 18.8201 22.2529 18.6835V18.1488C22.2529 17.6247 21.8281 17.2 21.3041 17.2C20.7801 17.2 20.3553 17.6247 20.3553 18.1488V18.6727C19.7853 18.784 19.2846 19.0053 18.8853 19.3313C18.2783 19.8269 17.9361 20.5413 17.9361 21.3856C17.9361 22.1839 18.2758 22.7614 18.7673 23.1818C19.2408 23.5867 19.8532 23.8449 20.4115 24.0477C20.5949 24.1143 20.7697 24.1743 20.9352 24.2311C21.3023 24.357 21.6238 24.4673 21.8916 24.5996C22.2867 24.7948 22.3601 24.9414 22.3601 25.0592C22.3601 25.2568 22.2935 25.3722 22.1499 25.4615C21.9737 25.571 21.6517 25.656 21.1137 25.656C20.5908 25.656 20.0578 25.5253 19.5717 25.2533C19.0767 24.9762 18.3454 25.0193 17.9738 25.5823C17.7009 25.9958 17.7208 26.6239 18.2134 26.9511C18.84 27.3673 19.6324 27.6286 20.3553 27.739V28.2512C20.3553 28.7752 20.7801 29.2 21.3041 29.2C21.8281 29.2 22.2529 28.7752 22.2529 28.2512V27.6889Z" fill="currentColor"></path></svg>
  `) as SVGAElement;
  if (width) icon.style.width = width;
  if (height) icon.style.height = height;
  if (color) icon.style.color = color;
  return icon;
}