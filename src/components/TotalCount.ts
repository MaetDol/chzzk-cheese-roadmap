import { DonationType, StreamerSummary } from '@/types';
import { Icon } from './Icon';
import { Text } from './Text';

export function TotalCount(groupedChzInfos: StreamerSummary[]) {
  const countsByType = groupedChzInfos
    .flatMap(({ purchases }) => purchases)
    .reduce<Record<DonationType, number>>(
      (groups, purchase) => {
        groups[purchase.donationType] += 1;
        return groups;
      },
      {
        [DonationType.CHAT]: 0,
        [DonationType.MISSION]: 0,
        [DonationType.VIDEO]: 0,
        [DonationType.TTS]: 0,
      },
    );

  const chatCount = getCardElem(
    Icon.ChatDonation({
      width: '58px',
      height: '58px',
      color: '#ffffffaa',
    }),
    countsByType[DonationType.CHAT].toLocaleString(),
    {
      backgroundColor: '#ff8800',
    },
  );
  const videoCount = getCardElem(
    Icon.VideoDonation({
      width: '58px',
      height: '58px',
      color: '#ffffffaa',
    }),
    countsByType[DonationType.VIDEO].toLocaleString(),
    { backgroundColor: '#ffa200' },
  );
  const missionCount = getCardElem(
    Icon.MissionDonation({
      width: '58px',
      height: '58px',
      color: '#ffffffaa',
    }),
    countsByType[DonationType.MISSION].toLocaleString(),
    { backgroundColor: '#ffc300' },
  );

  const div = document.createElement('div');
  div.style.display = 'flex';
  div.style.gap = '8px';
  div.append(chatCount);
  div.append(videoCount);
  div.append(missionCount);

  return div;
}
function getCardElem(
  icon: SVGElement,
  text: string,
  { backgroundColor }: { backgroundColor?: string } = {},
) {
  const div = document.createElement('div');
  div.append(icon);
  const textElem = Text(text, {
    useChzzkFont: true,
  });
  textElem.style.color = 'white';
  div.append(textElem);

  div.style.padding = '0 16px';
  div.style.borderRadius = '4px';
  div.style.backgroundColor = '#ebedf0';
  div.style.outline = '2px solid #1b1f230f';
  div.style.outlineOffset = '-1px';
  div.style.display = 'flex';
  div.style.flexFlow = 'column';
  div.style.gap = '8px';
  div.style.alignItems = 'center';
  div.style.justifyContent = 'center';
  div.style.backgroundColor = backgroundColor ?? '#ebedf0';

  return div;
}
