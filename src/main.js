// ==UserScript==
// @name         Chzzk Cheese Roadmap
// @namespace    http://tampermonkey.net/
// @version      0.1.1
// @updateURL    https://gist.github.com/MaetDol/ffe51512112bfbb5ece55799eb1c0b7b/raw/cheese-roadmap.user.js
// @downloadURL  https://gist.github.com/MaetDol/ffe51512112bfbb5ece55799eb1c0b7b/raw/cheese-roadmap.user.js
// @description  "내 치즈" 페이지에서 각 스트리머들에게 후원한 치즈 양을 확인할 수 있게 해줍니다
// @author       Maetdol
// @match        https://game.naver.com/profile
// @icon         https://ssl.pstatic.net/static/nng/glive/icon/cheese01.png
// @grant        GM_xmlhttpRequest
// @grant        GM_log
// @grant        GM_addStyle
// @grant        GM_addElement
// ==/UserScript==

// @ts-check

const CACHE_KEY = '_#Cheese_summary_info_cache';

main();

async function delay(ms) {
  return new Promise((rs) => setTimeout(rs, ms));
}

async function getChz(year, pg, getAll = false) {
  const { page, totalPages, data } = await getPurchaseHistory(pg, year);
  const hasMorePages = page + 1 < totalPages;
  let nextPurchaseInfoPages = [];
  if (getAll && hasMorePages) {
    await delay(100);
    nextPurchaseInfoPages = await getChz(year, page + 1, getAll);
  }
  return data.concat(nextPurchaseInfoPages);
}

/**
 * @typedef {{
 * channelId: string,
 * channelImageUrl: string,
 * channelName: string,
 * donationText: string,
 * donationType: 'CHAT' | 'VIDEO',
 * donationVideoType: null | string,
 * donationVideoUrl: string,
 * extras: unknown,
 * payAmount: number,
 * purchaseDate: string,
 * useSpeech: boolean
 * }} PurchaseHistory
 */

/**
 * @typedef {{
 * id: string,
 * name: string,
 * purchases: PurchaseHistory[],
 * sum: number,
 * thumbnail: string,
 * }} StreamerSummary
 */

/**
 *
 * @param {number} pg
 * @param {number} year
 * @returns {Promise<{ page: number, size: number, totalCount: number, totalPages: number, data: PurchaseHistory[] }>}
 */
async function getPurchaseHistory(pg, year) {
  const res = await fetch(
    `https://api.chzzk.naver.com/commercial/v1/product/purchase/history?page=${pg}&size=10&searchYear=${year}`,
    {
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6',
      },
      method: 'GET',
      credentials: 'include',
    }
  );
  const json = await res.json();
  return json.content;
}

async function main() {
  console.log('"치즈로드맵" 실행 중..');
  const isSameWithCache = await shouldUseCachedInfo();
  if (isSameWithCache) {
    appendResult(getCachedInfo());
    return;
  }

  let groupedChzInfos = await getGroupedAllChz();
  const cachedInfo = getCachedInfo()?.info;
  if (cachedInfo) {
    groupedChzInfos = mergeChzGroups(cachedInfo, groupedChzInfos);
  }
  setCachedInfo(groupedChzInfos);
  appendResult(groupedChzInfos);
}

/**
 * @description group1 과 group2 의 값을 합칩니다. 합칠 수 없는 값의 경우, group2 로 덮어씌워집니다
 * @param {StreamerSummary[]} group1
 * @param {StreamerSummary[]} group2
 */
function mergeChzGroups(group1, group2) {
  /** @type {StreamerSummary[]} */
  const newGroup = [];

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
    })
  );

  return newGroup;
}

async function setCachedInfo(groupedChzInfos) {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      info: groupedChzInfos,
      lastChzDate: getLastCheeseDateFromGroup(groupedChzInfos),
    })
  );
}

async function shouldUseCachedInfo() {
  const cachedInfo = getCachedInfo();
  if (!cachedInfo) return false;

  const lastChzDate = await getLastCheeseDate();
  if (!lastChzDate) return false;

  return cachedInfo.lastChzDate === lastChzDate;
}

/**
 *
 * @returns {{ lastChzDate: string, info: StreamerSummary[] } | null}
 */
function getCachedInfo() {
  return JSON.parse(localStorage.getItem(CACHE_KEY) ?? String(null));
}

async function getLastCheeseDate() {
  // 올해 후원한 내역이 없으면 어떻게 될까?
  const lastChzInfo = await getChz(new Date().getFullYear(), 0);
  const lastChzDate = lastChzInfo[0]?.purchaseDate ?? null;
  return lastChzDate;
}

function getLastCheeseDateFromGroup(group) {
  let lastDate = new Date(0);
  group.forEach(({ purchases }) => {
    purchases.forEach(({ purchaseDate }) => {
      if (new Date(purchaseDate) > lastDate) {
        lastDate = purchaseDate;
      }
    });
  });

  return lastDate;
}

function appendResult(groupedChzInfos) {
  const div = document.createElement('div');
  div.style.display = 'flex';
  div.style.margin = '0 0 16px 0';
  div.style.padding = '16px 0';
  div.style.overflowX = 'auto';
  div.style.alignItems = 'center';

  groupedChzInfos
    .sort((s1, s2) => s2.sum - s1.sum)
    .forEach(({ thumbnail, name, sum }) => {
      div.append(newStreamer(thumbnail, name, sum.toLocaleString()));
    });

  const resetButton = document.createElement('button');
  resetButton.innerText = '강제 새로고침';
  resetButton.style.background = '#eee';
  resetButton.style.padding = '4px';
  resetButton.style.borderRadius = '4px';
  const clearAll = async () => {
    resetButton.remove();
    div.remove();
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

    targetElem.after(div);
    targetElem.after(resetButton);
    clearInterval(intervalId);
  }, 200);
}

async function getChzsAfterDate(startYear, endYear, targetDateString) {
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
          new Date(targetDateString).getTime()
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

/**
 *
 * @returns {Promise<StreamerSummary[]>}
 */
async function getGroupedAllChz() {
  const START_YEAR = 2023;
  const TODAY_YEAR = Number(new Date().getFullYear());
  const chzs = [];

  const cachedInfoDate = getCachedInfo()?.lastChzDate;
  if (cachedInfoDate) {
    chzs.push(
      ...(await getChzsAfterDate(TODAY_YEAR, START_YEAR, cachedInfoDate))
    );
  } else {
    for (let year = TODAY_YEAR; year > START_YEAR; year--) {
      chzs.push(...(await getChz(year, 0, true)));
    }
  }

  const groupedChzInfos = chzs.reduce((map, chz) => {
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

function newStreamer(thumbnail, name, payAmount) {
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

function newThumbnail(thumbnail) {
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

function newTextInfo(name, payAmount) {
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
