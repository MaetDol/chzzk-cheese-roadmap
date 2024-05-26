import { getChz, getPurchaseHistory } from '@/api';
import { heatmap } from '@/components/Heatmap';
import { Text } from '@/components/Text';
import { PurchaseHistory, StreamerSummary } from '@/types';
import { delay } from '@/utils/delay';
import { TotalCount } from './components/TotalCount';

const CACHE_KEY = '_#Cheese_summary_info_cache';
const LOG_PREFIX = '[CHZ-ROADMAP]';

main();

function log(...args: unknown[]) {
  console.log(LOG_PREFIX, ...args);
}

async function main() {
  log(`"치즈로드맵" 실행 중..`);
  const isSameWithCache = await shouldUseCachedInfo();
  const cache = getCachedInfo();
  if (isSameWithCache && cache) {
    appendResult(cache.info);
    return;
  }

  let groupedChzInfos = await getGroupedAllChz();
  const cachedInfo = getCachedInfo()?.info;
  if (cachedInfo) {
    const lastChz = getLastCheeseFromGroup(cachedInfo);
    log(
      `캐싱된 정보 확인, 캐싱된 마지막 치즈: ${JSON.stringify(
        lastChz,
        null,
        4,
      )}`,
    );
    groupedChzInfos = mergeChzGroups(cachedInfo, groupedChzInfos);
  }
  setCachedInfo(groupedChzInfos);
  appendResult(groupedChzInfos);
}

function mergeChzGroups(group1: StreamerSummary[], group2: StreamerSummary[]) {
  const newGroup: StreamerSummary[] = [];

  [group1, group2].forEach((group) =>
    group.forEach((summary) => {
      const mergedSummary = newGroup.find((s) => s.id === summary.id);
      if (mergedSummary) {
        mergedSummary.sum += summary.sum;
        mergedSummary.thumbnail = summary.thumbnail;
        mergedSummary.name = summary.name;
        mergedSummary.purchases = [
          ...summary.purchases,
          ...mergedSummary.purchases,
        ];
      } else {
        newGroup.push({
          ...summary,
        });
      }
    }),
  );

  return newGroup;
}

type CacheType = {
  info: StreamerSummary[];
  lastChzDate: string;
};

async function setCachedInfo(groupedChzInfos: StreamerSummary[]) {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      info: groupedChzInfos,
      lastChzDate: getLastCheeseDateFromGroup(groupedChzInfos),
    }),
  );
}

async function shouldUseCachedInfo() {
  const cachedInfo = getCachedInfo();
  if (!cachedInfo) return false;

  const lastChzDate = await getLastCheeseDate();
  if (!lastChzDate) return false;

  return cachedInfo.lastChzDate === lastChzDate;
}

function getCachedInfo(): CacheType | null {
  return JSON.parse(localStorage.getItem(CACHE_KEY) ?? String(null));
}

async function getLastCheeseDate() {
  // 올해 후원한 내역이 없으면 어떻게 될까?
  const lastChzInfo = await getChz(new Date().getFullYear(), 0);
  const lastChzDate = lastChzInfo[0]?.purchaseDate ?? null;
  return lastChzDate;
}

function getLastCheeseDateFromGroup(group: StreamerSummary[]) {
  let lastDate = new Date(0);
  group.forEach(({ purchases }) => {
    purchases.forEach(({ purchaseDate }) => {
      if (new Date(purchaseDate) > lastDate) {
        lastDate = new Date(purchaseDate);
      }
    });
  });

  return lastDate;
}

function getLastCheeseFromGroup(
  group: StreamerSummary[],
): PurchaseHistory | null {
  let lastChz: PurchaseHistory | null = null;

  group.forEach(({ purchases }) => {
    purchases.forEach((chz) => {
      if (!lastChz) {
        lastChz = chz;
        return;
      }

      if (new Date(chz.purchaseDate) > new Date(lastChz.purchaseDate)) {
        lastChz = chz;
      }
    });
  });

  return lastChz;
}

function appendResult(groupedChzInfos: StreamerSummary[]) {
  const div = document.createElement('div');
  div.style.display = 'flex';
  div.style.padding = '16px 0';
  div.style.overflowX = 'auto';
  div.style.alignItems = 'center';

  groupedChzInfos
    .sort((s1, s2) => s2.sum - s1.sum)
    .forEach(({ thumbnail, name, sum }) => {
      div.append(newStreamer(thumbnail, name, sum.toLocaleString()));
    });

  const container = document.createElement('div');
  container.style.margin = '72px 0';

  const resetButton = document.createElement('button');
  resetButton.innerText = '강제 새로고침';
  resetButton.style.background = '#eee';
  resetButton.style.padding = '4px';
  resetButton.style.borderRadius = '4px';
  const clearAll = async () => {
    container.remove();
    await main();
  };
  resetButton.onclick = () => {
    localStorage.removeItem(CACHE_KEY);
    clearAll();
  };

  const intervalId = setInterval(() => {
    if (location.hash !== '#cash') {
      return;
    }

    const targetElem = document.querySelector(`[class^=header_container__]`);
    if (!targetElem) return;

    const totalWrap = document.createElement('div');
    totalWrap.style.display = 'flex';
    totalWrap.style.gap = '16px';
    totalWrap.style.marginBottom = '16px';
    totalWrap.append(
      Text(
        `${groupedChzInfos
          .reduce((total, { sum }) => sum + total, 0)
          .toLocaleString()} 치즈`,
        { size: '24px', useChzzkFont: true },
      ),
    );
    totalWrap.append(resetButton);

    container.append(totalWrap);
    container.append(div);

    const flex = document.createElement('div');
    flex.style.display = 'flex';
    flex.style.gap = '16px';
    flex.style.marginTop = '16px';

    flex.append(TotalCount(groupedChzInfos));
    flex.append(heatmap(groupedChzInfos));
    container.append(flex);

    targetElem.after(container);
    clearInterval(intervalId);
  }, 200);
}

async function getChzsAfterDate(
  startYear: number,
  endYear: number,
  targetDateString: string,
) {
  const chzs = [];

  // totalPages 가 모든 해의 페이지일까? 해당 년도의 페이지일까?
  for (let year = startYear; year >= endYear; year--) {
    let page = 0;
    let totalPages = 10;
    while (page < totalPages) {
      const { data, totalPages: MAX } = await getPurchaseHistory(page, year);
      totalPages = MAX;
      page += 1;

      const cachedHistoryIndex = data.findIndex(
        ({ purchaseDate }) =>
          new Date(purchaseDate).getTime() <=
          new Date(targetDateString).getTime(),
      );

      if (cachedHistoryIndex !== -1) {
        chzs.push(...data.slice(0, cachedHistoryIndex));
        return chzs;
      }

      chzs.push(...data);
      await delay(100);
    }
  }

  return chzs;
}

async function getGroupedAllChz(): Promise<StreamerSummary[]> {
  const START_YEAR = 2023;
  const TODAY_YEAR = Number(new Date().getFullYear());
  const chzs: PurchaseHistory[] = [];

  const cachedInfoDate = getCachedInfo()?.lastChzDate;
  if (cachedInfoDate) {
    chzs.push(
      ...(await getChzsAfterDate(TODAY_YEAR, START_YEAR, cachedInfoDate)),
    );
  } else {
    for (let year = TODAY_YEAR; year > START_YEAR; year--) {
      chzs.push(...(await getChz(year, 0, true)));
    }
  }

  const groupedChzInfos = chzs.reduce<StreamerSummary[]>((map, chz) => {
    const streamerIdx = map.findIndex((s) => s.id === chz.channelId);
    let streamer = map[streamerIdx];
    if (streamerIdx === -1) {
      streamer = {
        id: chz.channelId,
        purchases: [],
        sum: 0,
        thumbnail: chz.channelImageUrl,
        name: chz.channelName,
      };
      map.push(streamer);
    }

    streamer.purchases.push(chz);
    streamer.sum += chz.payAmount;

    return map;
  }, []);
  return groupedChzInfos;
}

function newStreamer(thumbnail: string, name: string, payAmount: string) {
  const parser = new DOMParser();
  const containerRaw = `<div
    style="
    display: flex;
    font-family: Sandoll Nemony2;
    color: #444;
    gap: 4px;
    flex-shrink: 0;
    margin-right: 32px;
  "></div>`;

  const container = parser.parseFromString(containerRaw, 'text/html').body
    .children[0];
  container.innerHTML = newThumbnail(thumbnail) + newTextInfo(name, payAmount);

  return container;
}

function newThumbnail(thumbnail: string) {
  return `<div
      style='
        background: #ebedf3 no-repeat 50% / cover;
        background-image: url("${thumbnail}");
        width: 64px;
        height: 64px;
        border-radius: 50%;
        margin-right: 8px;
    '></div>`;
}

function newTextInfo(name: string, payAmount: string) {
  return `
    <div
      style="
    display: flex;
    flex-flow: column;
    justify-content: center;
    gap: 8px;
"
    >
      <span
        style="
    font-size: 1.5rem;
    font-weight: bold;
    justify-content: center;
    width: 100%;
    letter-spacing: 0.1rem;
"
      >
       ${name}
      </span>
      <div style="
        display: flex;
      ">
        <i
          style="
              background-image: url(https://ssl.pstatic.net/static/nng/resource/p/static/media/sp_mw_23_1.cbb67524.png);
              background-size: 321px 307px;
              background-repeat: no-repeat;
              width: 20px;
              height: 20px;
              display: inline-block;
              background-position: -132px -126px;
              margin-right: 4px;
  "
        ></i>
        <span style="
          font-size: 1rem;
        ">${payAmount}</span>
      </div>
    </div>
  `;
}
