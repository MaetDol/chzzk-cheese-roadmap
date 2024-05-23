import { getYearMonthDateString } from '@/utils/date-to-year-month-date';

function block(level: number, price: number, date: string) {
  const parser = new DOMParser();
  const block = parser.parseFromString(
    `<div style="      
      width: 10px;
      height: 10px;
      border-radius: 2px;
      background-color: var(--level-${level});
      outline: 1px solid #1b1f230f;
      outline-offset: -1px;
      position: relative;
    "></div>`,
    'text/html'
  ).body.children[0];

  const tooltip = getTooltip(date, price);

  block.addEventListener('mouseover', () => {
    block.append(tooltip);
    tooltip.animate(
      [
        {
          opacity: '0',
          transform: 'translateX(-50%) scale(0.85)',
        },
        {
          opacity: '1',
          transform: 'translateX(-50%) scale(1)',
        },
      ],
      {
        duration: 200,
        easing: 'ease-out',
      }
    );
  });
  block.addEventListener('mouseleave', () => tooltip.remove());

  return block;
}

function getTooltip(date: string, price: number) {
  const tooltip = document.createElement('div');
  tooltip.innerText =
    date.replace('-', '년 ').replace('-', '월 ') +
    '일에, ' +
    price.toLocaleString() +
    ' 치즈 만큼 후원했어요';

  tooltip.style.position = 'absolute';
  tooltip.style.bottom = 'calc(100% + 3px)';
  tooltip.style.left = '50%';
  tooltip.style.transform = 'translateX(-50%)';
  tooltip.style.backgroundColor = '#24292f';
  tooltip.style.color = 'white';
  tooltip.style.fontSize = '12px';
  tooltip.style.padding = '4px 8px';
  tooltip.style.whiteSpace = 'pre';
  tooltip.style.zIndex = '111';
  tooltip.style.borderRadius = '4px';
  tooltip.style.boxShadow = '2px 2px 8px rgba(0, 0, 0, 0.2)';

  return tooltip;
}

export function drawBlocks(
  dateWithLevel: Record<string, { price: number; level: number }>
) {
  const blocks = [];
  const today = new Date();
  const DAY = 24 * 60 * 60 * 1000;

  for (let i = 0; i < 365; i++) {
    const key = getYearMonthDateString(today);
    const { level = 0, price = 0 } = dateWithLevel[key] ?? {};
    blocks.push(block(level, price, key));
    today.setTime(today.getTime() - DAY);
  }

  const parser = new DOMParser();
  const container = parser.parseFromString(
    `
    <div style="
      margin-top: 40px;
      display: grid;
      grid-template-rows: repeat(7, 10px);
      grid-auto-flow: column;
      grid-template-columns: repeat(auto-fit, 10px);
      gap: 3px;

      --level-0: #ebedf0;
      --level-1: #fff056;
      --level-2: #ffe246;
      --level-3: #fecf3e;
      --level-4: #fdb833;
    ">
    </div>
    `,
    'text/html'
  ).body.children[0];

  blocks.forEach((b) => container.append(b));
  return container;
}
