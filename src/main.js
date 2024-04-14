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

async function delay(ms) {
  return new Promise((rs) => setTimeout(rs, ms));
}

async function getChz(year, pg, getAll = false) {
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

  const { page, totalPages, data } = json.content;
  const hasMorePages = page + 1 < totalPages;
  let nextPurchaseInfoPages = [];
  if (getAll && hasMorePages) {
    await delay(30);
    nextPurchaseInfoPages = await getChz(year, page + 1, getAll);
  }
  return data.concat(nextPurchaseInfoPages);
}

const CACHE_KEY = '_#Cheese_summary_info_cache';
async function main() {
  console.log('"치즈로드맵" 실행 중..');
  const cachedInfo = JSON.parse(
    localStorage.getItem(CACHE_KEY) ?? String(null)
  );

  const lastChzInfo = await getChz(new Date().getFullYear(), 0);
  const lastChzDate = lastChzInfo[0]?.purchaseDate ?? null;
  if (!lastChzDate) return;

  let groupedChzInfos = cachedInfo?.info;
  if (cachedInfo?.lastChzDate !== lastChzDate) {
    groupedChzInfos = await getGroupedAllChz();
  }

  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      info: groupedChzInfos,
      lastChzDate,
    })
  );

  appendResult(groupedChzInfos);
}

main();

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
    isVisible = false;
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

async function getGroupedAllChz() {
  const START_YEAR = 2023;
  const TODAY_YEAR = Number(new Date().getFullYear());
  const chzs = [];
  for (let year = TODAY_YEAR; year > START_YEAR; year--) {
    chzs.push(...(await getChz(year, 0, true)));
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
