// ==UserScript==
// @name         Chzzk Cheese Roadmap
// @namespace    http://tampermonkey.net/
// @version      0.6.4
// @updateURL    https://raw.githubusercontent.com/MaetDol/chzzk-cheese-roadmap/release/cheese-roadmap.user.js
// @downloadURL  https://raw.githubusercontent.com/MaetDol/chzzk-cheese-roadmap/release/cheese-roadmap.user.js
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
  const { page, totalPages, data } = await getPurchaseHistory(pg, year);
  const hasMorePages = page + 1 < totalPages;
  let nextPurchaseInfoPages = [];
  if (getAll && hasMorePages) {
    await delay(100);
    nextPurchaseInfoPages = await getChz(year, page + 1, getAll);
  }
  return data.concat(nextPurchaseInfoPages);
}
async function getPurchaseHistory(pg, year) {
  const res = await fetch(
    `https://api.chzzk.naver.com/commercial/v1/product/purchase/history?page=${pg}&size=10&searchYear=${year}`,
    {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6"
      },
      method: "GET",
      credentials: "include"
    }
  );
  const json = await res.json();
  return json.content;
}
async function getUserHash() {
  const res = await fetch(
    `https://comm-api.game.naver.com/nng_main/v2/user/profile`,
    {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6"
      },
      method: "GET",
      credentials: "include"
    }
  );
  const json = await res.json();
  return json.content.userIdHash;
}
function Text(text, { useChzzkFont, size } = {}) {
  const span = document.createElement("span");
  span.innerText = text;
  span.style.fontFamily = `${useChzzkFont ? "Sandoll" : ""} Nemony2`;
  span.style.color = "#444";
  span.style.fontSize = size ?? "18px";
  return span;
}
function Heading(level, text) {
  const heading = document.createElement(`h${level}`);
  heading.append(Text(text, { useChzzkFont: true, size: "initial" }));
  return heading;
}
class Kmeans {
  constructor({
    tolerance = 0.01,
    max_iteration = 300,
    k = 0,
    dimension: dims = 1,
    datas = [],
    usePPS = true
  } = {}) {
    this.tolerance = tolerance;
    this.max_iteration = max_iteration;
    this.usePPS = usePPS;
    this.k = k;
    this.dims = dims > 0 ? dims : 1;
    this.datas = datas;
    this.centroids = [];
    this.initSub();
  }
  initSub() {
    switch (this.dims) {
      case 1:
        this.add = (a, b) => a + b;
        this.sub = (a, b) => (a - b) ** 2;
        this.divider = (a, b) => a / b;
        this.ZERO_POINT = 0;
        break;
      case 2:
        this.add = ([x, y], [x2, y2 = y2]) => [x + x2, y + y2];
        this.sub = ([x, y], [x2, y2 = x2]) => (x - x2) ** 2 + (y - y2) ** 2;
        this.divider = ([x, y], [x2, y2 = x2]) => [x / x2, y / y2];
        this.ZERO_POINT = [0, 0];
        break;
      case 3:
        this.add = ([x, y, z], [x2, y2 = x2, z2 = x2]) => [x + x2, y + y2, z + z2];
        this.sub = ([x, y, z], [x2, y2 = x2, z2 = x2]) => (x - x2) ** 2 + (y - y2) ** 2 + (z - z2) ** 2;
        this.divider = ([x, y, z], [x2, y2 = x2, z2 = x2]) => [x / x2, y / y2, z / z2];
        this.ZERO_POINT = [0, 0, 0];
        break;
    }
  }
  sub() {
  }
  add() {
  }
  divider() {
  }
  set datas(datas) {
    this._datas = datas;
  }
  get datas() {
    return this._datas;
  }
  set dims(dims) {
    this._dims = dims > 0 ? dims : 1;
    this.initSub();
  }
  get dims() {
    return this._dims;
  }
  distanceTo(centroid) {
    return this.datas.map((d) => this.sub(d, centroid));
  }
  min(a, b) {
    const [longArr, shortArr] = a.length > b.length ? [a, b] : [b, a];
    return longArr.map((val, idx) => Math.min(
      val,
      shortArr.length > idx ? shortArr[idx] : val
    ));
  }
  sum(a) {
    return a.reduce((acc, val) => acc + val, 0);
  }
  weightedRandom(weights) {
    const weightsSum = this.sum(weights), r = Math.random();
    let sum = 0;
    if (weightsSum === 0)
      return 0;
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i] / weightsSum;
      if (r <= sum) {
        return i;
      }
    }
    return sum / weights.length;
  }
  indexOfMax(arr) {
    return arr.reduce(
      (max, val, idx, arr2) => arr2[max] < val ? idx : max,
      0
    );
  }
  kmeansPP() {
    const randomIndex = parseInt(Math.random() * this.datas.length);
    let centroids = [this.datas[randomIndex]];
    let minDistances = this.distanceTo(centroids[0]);
    for (let i = 0; i < this.k - 1; i++) {
      const distances = this.min(minDistances, this.distanceTo(centroids[i]));
      let newCentroid = null;
      if (this.usePPS) {
        newCentroid = this.datas[this.weightedRandom(distances)];
      } else {
        newCentroid = this.datas[this.indexOfMax(distances)];
      }
      centroids.push(newCentroid);
      minDistances = distances;
    }
    return centroids;
  }
  multipleFit(runCount) {
    const datas = this.datas;
    const centroidCandidates = [];
    for (let i = 0; i < runCount; i++) {
      this.fit().forEach((c) => centroidCandidates.push(c));
    }
    return this.fit({
      centroids: this.fit({ datas: centroidCandidates }),
      datas
    });
  }
  fit({ centroids, datas = this.datas } = {}) {
    if (!(datas == null ? void 0 : datas.length))
      throw new Error("Empty data is not valid. Please provide datas");
    this.datas = datas;
    centroids = centroids || this.kmeansPP();
    for (let iterate = 0; iterate < this.max_iteration; iterate++) {
      const classifications = this.classifications = this.classify(centroids);
      let inTolerance = true;
      const previousCentroids = [...centroids];
      centroids = classifications.map((cls, i) => {
        return cls.length ? this.average(cls) : centroids[i];
      });
      for (let i = 0; i < previousCentroids.length; i++) {
        const difference = this.difference(previousCentroids[i], centroids[i]);
        if (difference > this.tolerance) {
          inTolerance = false;
          break;
        }
      }
      if (inTolerance) {
        break;
      }
    }
    return centroids;
  }
  classify(centroids) {
    const classifications = Array.from({ length: this.k }, () => []);
    this.datas.forEach((data) => {
      const { centroidIndex } = this.nearestOf(data, centroids);
      classifications[centroidIndex].push(data);
    });
    return classifications;
  }
  difference(data1, data2) {
    return this.sub(data1, data2) / this.maxData * 100;
  }
  average(arr) {
    const length = this.dims === 1 ? arr.length : Array.from(this.ZERO_POINT, () => arr.length);
    return this.divider(
      arr.reduce(this.add),
      length
    );
  }
  nearestOf(data, centroids) {
    let nearest = { value: Number.MAX_SAFE_INTEGER };
    centroids.forEach((c, idx) => {
      const d = {
        centroidIndex: idx,
        value: this.sub(data, c)
      };
      nearest = nearest.value > d.value ? d : nearest;
    });
    return nearest;
  }
}
const formatter = Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});
function getYearMonthDateString(date) {
  const parts = new Map(
    formatter.formatToParts(date).map(({ type, value }) => [type, value])
  );
  return `${parts.get("year")}-${parts.get("month")}-${parts.get("day")}`;
}
const parser = new DOMParser();
function parseHtml(html) {
  return parser.parseFromString(html, "text/html").body.children[0];
}
function block(level, tooltip, tooltipWrapper) {
  const parser2 = new DOMParser();
  const block2 = parser2.parseFromString(
    `<div style="      
      width: 10px;
      height: 10px;
      border-radius: 2px;
      background-color: var(--level-${level});
      outline: 1px solid #1b1f230f;
      outline-offset: -1px;
      position: relative;
    "></div>`,
    "text/html"
  ).body.children[0];
  if (tooltip && tooltipWrapper) {
    block2.addEventListener(
      "mouseover",
      () => showTooltip(block2, tooltip, tooltipWrapper)
    );
    block2.addEventListener("mouseleave", () => tooltip.remove());
  }
  return block2;
}
function getTooltip(date, price) {
  const tooltip = document.createElement("div");
  tooltip.innerText = date.replace("-", "년 ").replace("-", "월 ") + "일에, " + price.toLocaleString() + " 치즈 만큼 후원했어요";
  tooltip.style.backgroundColor = "#24292f";
  tooltip.style.color = "white";
  tooltip.style.fontSize = "12px";
  tooltip.style.padding = "4px 8px";
  tooltip.style.whiteSpace = "pre";
  tooltip.style.zIndex = "111";
  tooltip.style.borderRadius = "4px";
  tooltip.style.boxShadow = "2px 2px 8px rgba(0, 0, 0, 0.2)";
  return tooltip;
}
function drawBlocks(dateWithLevel, tooltipWrapper) {
  const blocks = [];
  const today = /* @__PURE__ */ new Date();
  const DAY = 24 * 60 * 60 * 1e3;
  for (let i = 0; i < 365; i++) {
    const key = getYearMonthDateString(today);
    const { level = 0, price = 0 } = dateWithLevel[key] ?? {};
    const tooltip = getTooltip(key, price);
    blocks.push(block(level, tooltip, tooltipWrapper));
    today.setTime(today.getTime() - DAY);
  }
  const parser2 = new DOMParser();
  const container = parser2.parseFromString(
    `
    <div style="
      margin-top: 8px;
      display: grid;
      grid-template-rows: repeat(7, 10px);
      grid-auto-flow: column;
      grid-template-columns: repeat(auto-fit, 10px);
      gap: 3px;
      padding-bottom: 8px;
      overflow-y: auto;
    ">
    </div>
    `,
    "text/html"
  ).body.children[0];
  blocks.forEach((b) => container.append(b));
  return container;
}
function heatmap(groupedChzInfos) {
  const dateWithPrice = groupedChzInfos.flatMap(({ purchases: purchases2 }) => purchases2).reduce((map, history) => {
    const key = getYearMonthDateString(
      /* @__PURE__ */ new Date(history.purchaseDate.replace(" ", "T") + "+09:00")
    );
    map[key] = (map[key] ?? 0) + history.payAmount;
    return map;
  }, {});
  const purchases = Object.values(dateWithPrice);
  const kmeans = new Kmeans({ k: 4, datas: purchases });
  if (purchases.length) {
    kmeans.multipleFit(500);
  }
  const dateWithLevel = {};
  if (kmeans.classifications) {
    const sortedCls = kmeans.classifications.map((prices) => prices.sort((a, b) => a - b)).sort((a, b) => a[0] - b[0]);
    for (const date in dateWithPrice) {
      const price = dateWithPrice[date];
      dateWithLevel[date] = {
        price,
        level: sortedCls.findIndex((cluster) => cluster.includes(price)) + 1
      };
    }
  }
  const div = document.createElement("div");
  div.style.minWidth = "0";
  div.style.position = "relative";
  const scrollWrapper = parseHtml(`
    <div style="
      --level-0: #ebedf0;
      --level-1: #fff056;
      --level-2: #ffc300;
      --level-3: #ffa200;
      --level-4: #ff8800;
      overflow-y: hidden;
    ">
    </div>
  `);
  const heading = Heading(2, "치즈 히트맵");
  heading.style.display = "flex";
  heading.style.alignItems = "center";
  heading.style.gap = "5px";
  heading.append(block(0));
  heading.append(block(1));
  heading.append(block(2));
  heading.append(block(3));
  heading.append(block(4));
  scrollWrapper.append(heading);
  scrollWrapper.append(drawBlocks(dateWithLevel, div));
  div.append(scrollWrapper);
  return div;
}
function showTooltip(block2, tooltip, appendTooltipOn) {
  const top = block2.offsetTop;
  const left = block2.offsetLeft;
  const width = block2.clientWidth;
  tooltip.style.position = "absolute";
  tooltip.style.left = left + width / 2 + "px";
  tooltip.style.top = top + "px";
  const translate = "translate(-50%, calc(-100% - 3px))";
  tooltip.style.transform = translate;
  appendTooltipOn.append(tooltip);
  tooltip.animate(
    [
      {
        opacity: "0",
        transform: translate + " scale(0.85)"
      },
      {
        opacity: "1",
        transform: translate + " scale(1)"
      }
    ],
    {
      duration: 200,
      easing: "ease-out"
    }
  );
}
var DonationType = /* @__PURE__ */ ((DonationType2) => {
  DonationType2["CHAT"] = "CHAT";
  DonationType2["VIDEO"] = "VIDEO";
  DonationType2["MISSION"] = "MISSION";
  DonationType2["TTS"] = "TTS";
  return DonationType2;
})(DonationType || {});
function ChatDonation({ color, height, width } = {}) {
  const icon = parseHtml(
    `<svg 
      width="32" 
      height="32" 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        fill-rule="evenodd" 
        clip-rule="evenodd" 
        d="M15.2 5.99985C9.67714 5.99985 5.19999 10.477 5.19999 15.9999C5.19999 21.5227 9.67714 25.9999 15.2 25.9999H25.1029L23.0308 23.9277C22.5952 23.4921 22.5602 22.7973 22.9499 22.3202C24.3569 20.5971 25.2 18.3986 25.2 15.9999C25.2 10.477 20.7228 5.99985 15.2 5.99985ZM2.79999 15.9999C2.79999 9.15152 8.35166 3.59985 15.2 3.59985C22.0483 3.59985 27.6 9.15152 27.6 15.9999C27.6 18.5802 26.8107 20.9787 25.4611 22.9639L28.8485 26.3513C29.1917 26.6945 29.2944 27.2107 29.1086 27.6591C28.9229 28.1075 28.4853 28.3999 28 28.3999H15.2C8.35166 28.3999 2.79999 22.8482 2.79999 15.9999Z" 
        fill="currentColor"
      ></path>
      <path 
        d="M12.324 19.5845C12.9727 20.0154 13.8146 20.2751 14.5552 20.3646V21.0511C14.5552 21.4647 14.8904 21.7999 15.304 21.7999C15.7176 21.7999 16.0528 21.4647 16.0528 21.0511V20.3235C16.6873 20.2137 17.2169 19.9883 17.624 19.6632C18.2227 19.1851 18.5392 18.5048 18.5392 17.7135C18.5392 16.9688 18.2325 16.4348 17.7791 16.0409C17.3345 15.6547 16.7514 15.4048 16.1946 15.2054C15.999 15.1353 15.8088 15.072 15.6272 15.0116C15.2765 14.8948 14.9574 14.7886 14.6911 14.6642C14.2806 14.4725 14.1152 14.29 14.1152 14.0735C14.1152 13.8257 14.2204 13.6534 14.4121 13.5331C14.6153 13.4057 14.9255 13.3327 15.3264 13.3327C15.8441 13.3327 16.3244 13.477 16.7878 13.7549C17.1644 13.9808 17.6859 13.957 17.9933 13.5915C18.2862 13.2431 18.267 12.6972 17.8722 12.4134C17.3607 12.0459 16.7767 11.768 16.0528 11.6504V10.9487C16.0528 10.5352 15.7176 10.1999 15.304 10.1999C14.8904 10.1999 14.5552 10.5352 14.5552 10.9487V11.6407C13.9442 11.7347 13.418 11.9545 13.0117 12.2862C12.4527 12.7426 12.136 13.3994 12.136 14.1855C12.136 14.9179 12.4441 15.4422 12.8973 15.8297C13.3414 16.2096 13.924 16.4578 14.4797 16.6597C14.6531 16.7227 14.8225 16.7808 14.9855 16.8367C15.3596 16.9651 15.7004 17.082 15.9802 17.2203C16.3851 17.4203 16.56 17.6168 16.56 17.8591C16.56 18.1203 16.4623 18.3026 16.2554 18.4313C16.0322 18.57 15.6654 18.6559 15.1136 18.6559C14.5576 18.6559 13.9908 18.517 13.474 18.2277C13.0461 17.9882 12.4404 18.0384 12.1407 18.4924C11.9149 18.8346 11.9425 19.3311 12.324 19.5845Z" 
        fill="currentColor" 
        stroke="currentColor" 
        stroke-width="0.4"
      ></path>
    </svg>`
  );
  if (width)
    icon.style.width = width;
  if (height)
    icon.style.height = height;
  if (color)
    icon.style.color = color;
  return icon;
}
function MissionDonation({ color, height, width }) {
  const icon = parseHtml(
    `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M27.2 15.9998C27.2 22.1854 22.1856 27.1998 16 27.1998C9.8144 27.1998 4.79999 22.1854 4.79999 15.9998C4.79999 9.81422 9.8144 4.7998 16 4.7998" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"></path><path d="M22.4 16.0001C22.4 19.5347 19.5346 22.4001 16 22.4001C12.4654 22.4001 9.59998 19.5347 9.59998 16.0001C9.59998 12.4655 12.4654 9.6001 16 9.6001" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"></path><path d="M15.53 14.3737C15.0736 14.8542 15.093 15.6137 15.5735 16.0702C16.054 16.5267 16.8136 16.5072 17.27 16.0267L15.53 14.3737ZM17.27 16.0267L24.87 8.02669L23.13 6.3737L15.53 14.3737L17.27 16.0267Z" fill="currentColor"></path><path d="M20.4938 5.99561L21.6959 9.60157C21.7437 9.74492 21.8561 9.8574 21.9995 9.90516L25.6043 11.1063C25.7768 11.1638 25.9669 11.1189 26.0955 10.9903L29.3212 7.76453C29.6009 7.48482 29.4412 7.00585 29.0496 6.94994L25.5564 6.45118C25.3452 6.42103 25.1793 6.25508 25.1491 6.04388L24.6501 2.55042C24.5941 2.15886 24.1152 1.9992 23.8355 2.27888L20.6098 5.50439C20.4812 5.63295 20.4363 5.82312 20.4938 5.99561Z" fill="currentColor"></path></svg>`
  );
  if (width)
    icon.style.width = width;
  if (height)
    icon.style.height = height;
  if (color)
    icon.style.color = color;
  return icon;
}
function VideoDonation({ color, height, width }) {
  const icon = parseHtml(`
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.03369 3.84058C5.10957 3.84058 2.73911 6.21105 2.73911 9.13516V21.634C2.73911 24.5581 5.10956 26.9286 8.03368 26.9286H12.2091C12.2713 26.9385 12.335 26.9437 12.4 26.9437C13.0628 26.9437 13.6 26.4064 13.6 25.7437C13.6 25.102 13.0963 24.5779 12.4627 24.5453V24.5286H8.03368C6.43505 24.5286 5.13911 23.2326 5.13911 21.634V9.13516C5.13911 7.53653 6.43505 6.24058 8.03369 6.24058H24.0223C25.6209 6.24058 26.9169 7.53652 26.9169 9.13516V21.272H26.9311C26.929 21.3008 26.928 21.33 26.928 21.3593C26.928 22.0221 27.4652 22.5593 28.128 22.5593C28.7907 22.5593 29.328 22.0221 29.328 21.3593C29.328 21.3038 29.3242 21.2491 29.3169 21.1956V9.13516C29.3169 6.21104 26.9464 3.84058 24.0223 3.84058H8.03369Z" fill="currentColor"></path><path d="M19.3084 14.7334C19.6322 14.9259 19.6322 15.4072 19.3084 15.5998L13.4798 19.0654C13.156 19.258 12.7513 19.0173 12.7513 18.6322L12.7513 11.7009C12.7513 11.3158 13.156 11.0752 13.4798 11.2677L19.3084 14.7334Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M22.2529 27.6889C22.8429 27.5652 23.3478 27.3397 23.7489 27.0195C24.3975 26.5016 24.7393 25.7625 24.7393 24.9136C24.7393 24.1045 24.4024 23.5174 23.9104 23.09C23.436 22.6778 22.8226 22.4179 22.2622 22.2172C22.0547 22.1429 21.8589 22.0777 21.6751 22.0166C21.3326 21.9027 21.032 21.8027 20.7758 21.6831C20.3696 21.4933 20.3153 21.3593 20.3153 21.2736C20.3153 21.0972 20.3828 20.9877 20.5184 20.9026C20.6771 20.8031 20.9446 20.7328 21.3265 20.7328C21.8042 20.7328 22.2494 20.8652 22.685 21.1265C23.1287 21.3926 23.7638 21.3753 24.1464 20.9202C24.5041 20.4949 24.4908 19.8117 23.989 19.4511C23.4943 19.0955 22.933 18.8201 22.2529 18.6835V18.1488C22.2529 17.6247 21.8281 17.2 21.3041 17.2C20.7801 17.2 20.3553 17.6247 20.3553 18.1488V18.6727C19.7853 18.784 19.2846 19.0053 18.8853 19.3313C18.2783 19.8269 17.9361 20.5413 17.9361 21.3856C17.9361 22.1839 18.2758 22.7614 18.7673 23.1818C19.2408 23.5867 19.8532 23.8449 20.4115 24.0477C20.5949 24.1143 20.7697 24.1743 20.9352 24.2311C21.3023 24.357 21.6238 24.4673 21.8916 24.5996C22.2867 24.7948 22.3601 24.9414 22.3601 25.0592C22.3601 25.2568 22.2935 25.3722 22.1499 25.4615C21.9737 25.571 21.6517 25.656 21.1137 25.656C20.5908 25.656 20.0578 25.5253 19.5717 25.2533C19.0767 24.9762 18.3454 25.0193 17.9738 25.5823C17.7009 25.9958 17.7208 26.6239 18.2134 26.9511C18.84 27.3673 19.6324 27.6286 20.3553 27.739V28.2512C20.3553 28.7752 20.7801 29.2 21.3041 29.2C21.8281 29.2 22.2529 28.7752 22.2529 28.2512V27.6889Z" fill="currentColor"></path></svg>
  `);
  if (width)
    icon.style.width = width;
  if (height)
    icon.style.height = height;
  if (color)
    icon.style.color = color;
  return icon;
}
const Icon = {
  ChatDonation,
  MissionDonation,
  VideoDonation
};
function TotalCount(groupedChzInfos) {
  const countsByType = groupedChzInfos.flatMap(({ purchases }) => purchases).reduce(
    (groups, purchase) => {
      groups[purchase.donationType] += 1;
      return groups;
    },
    {
      [DonationType.CHAT]: 0,
      [DonationType.MISSION]: 0,
      [DonationType.VIDEO]: 0,
      [DonationType.TTS]: 0
    }
  );
  const chatCount = getCardElem(
    Icon.ChatDonation({
      width: "58px",
      height: "58px",
      color: "#ffffffaa"
    }),
    countsByType[DonationType.CHAT].toLocaleString(),
    {
      backgroundColor: "#ff8800"
    }
  );
  const videoCount = getCardElem(
    Icon.VideoDonation({
      width: "58px",
      height: "58px",
      color: "#ffffffaa"
    }),
    countsByType[DonationType.VIDEO].toLocaleString(),
    { backgroundColor: "#ffa200" }
  );
  const missionCount = getCardElem(
    Icon.MissionDonation({
      width: "58px",
      height: "58px",
      color: "#ffffffaa"
    }),
    countsByType[DonationType.MISSION].toLocaleString(),
    { backgroundColor: "#ffc300" }
  );
  const div = document.createElement("div");
  div.style.display = "flex";
  div.style.gap = "8px";
  div.append(chatCount);
  div.append(videoCount);
  div.append(missionCount);
  return div;
}
function getCardElem(icon, text, { backgroundColor } = {}) {
  const div = document.createElement("div");
  div.append(icon);
  const textElem = Text(text, {
    useChzzkFont: true
  });
  textElem.style.color = "white";
  div.append(textElem);
  div.style.padding = "0 16px";
  div.style.borderRadius = "4px";
  div.style.backgroundColor = "#ebedf0";
  div.style.outline = "2px solid #1b1f230f";
  div.style.outlineOffset = "-1px";
  div.style.display = "flex";
  div.style.flexFlow = "column";
  div.style.gap = "8px";
  div.style.alignItems = "center";
  div.style.justifyContent = "center";
  div.style.backgroundColor = backgroundColor ?? "#ebedf0";
  return div;
}
const CACHE_KEY = "_#Cheese_summary_info_cache";
const LOG_PREFIX = "[CHZ-ROADMAP]";
main();
function log(...args) {
  console.log(LOG_PREFIX, ...args);
}
async function main() {
  var _a;
  log(`"치즈로드맵" 실행 중..`);
  const hash = await getUserHash();
  const cache = getCachedInfo();
  if (cache && cache.hash !== hash) {
    log(`다른 계정 확인됨. 정보 초기화 중...`);
    localStorage.removeItem(CACHE_KEY);
  }
  const isSameWithCache = await shouldUseCachedInfo();
  if (isSameWithCache && cache) {
    appendResult(cache.info);
    return;
  }
  let groupedChzInfos = await getGroupedAllChz();
  const cachedInfo = (_a = getCachedInfo()) == null ? void 0 : _a.info;
  if (cachedInfo) {
    const lastChz = getLastCheeseFromGroup(cachedInfo);
    log(
      `캐싱된 정보 확인, 캐싱된 마지막 치즈: ${JSON.stringify(
        lastChz,
        null,
        4
      )}`
    );
    groupedChzInfos = mergeChzGroups(cachedInfo, groupedChzInfos);
  }
  setCachedInfo(hash, groupedChzInfos);
  appendResult(groupedChzInfos);
}
function mergeChzGroups(group1, group2) {
  const newGroup = [];
  [group1, group2].forEach(
    (group) => group.forEach((summary) => {
      const mergedSummary = newGroup.find((s) => s.id === summary.id);
      if (mergedSummary) {
        mergedSummary.totalDonation = (mergedSummary.totalDonation ?? mergedSummary.sum) + (summary.totalDonation ?? summary.sum);
        mergedSummary.sum += summary.sum;
        mergedSummary.thumbnail = summary.thumbnail;
        mergedSummary.name = summary.name;
        mergedSummary.purchases = [
          ...summary.purchases,
          ...mergedSummary.purchases
        ];
      } else {
        newGroup.push({
          ...summary,
          totalDonation: summary.totalDonation ?? summary.sum
        });
      }
    })
  );
  return newGroup;
}
async function setCachedInfo(hash, groupedChzInfos) {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      hash,
      info: groupedChzInfos,
      lastChzDate: getLastCheeseDateFromGroup(groupedChzInfos)
    })
  );
}
async function shouldUseCachedInfo() {
  const cachedInfo = getCachedInfo();
  if (!cachedInfo)
    return false;
  const lastChzDate = await getLastCheeseDate();
  if (!lastChzDate)
    return false;
  return cachedInfo.lastChzDate === lastChzDate;
}
function getCachedInfo() {
  return JSON.parse(localStorage.getItem(CACHE_KEY) ?? String(null));
}
async function getLastCheeseDate() {
  var _a;
  const lastChzInfo = await getChz((/* @__PURE__ */ new Date()).getFullYear(), 0);
  const lastChzDate = ((_a = lastChzInfo[0]) == null ? void 0 : _a.purchaseDate) ?? null;
  return lastChzDate;
}
function getLastCheeseDateFromGroup(group) {
  let lastDate = /* @__PURE__ */ new Date(0);
  group.forEach(({ purchases }) => {
    purchases.forEach(({ purchaseDate }) => {
      if (new Date(purchaseDate) > lastDate) {
        lastDate = new Date(purchaseDate);
      }
    });
  });
  return lastDate;
}
function getLastCheeseFromGroup(group) {
  let lastChz = null;
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
function appendResult(groupedChzInfos) {
  const div = document.createElement("div");
  div.style.display = "flex";
  div.style.padding = "16px 0";
  div.style.overflowX = "auto";
  div.style.alignItems = "center";
  groupedChzInfos.sort((s1, s2) => s2.totalDonation - s1.totalDonation).forEach(({ thumbnail, name, totalDonation }) => {
    div.append(newStreamer(thumbnail, name, totalDonation.toLocaleString()));
  });
  const container = document.createElement("div");
  container.style.margin = "72px 0";
  const resetButton = document.createElement("button");
  resetButton.innerText = "강제 새로고침";
  resetButton.style.background = "#eee";
  resetButton.style.padding = "4px";
  resetButton.style.borderRadius = "4px";
  const clearAll = async () => {
    container.remove();
    await main();
  };
  resetButton.onclick = () => {
    localStorage.removeItem(CACHE_KEY);
    clearAll();
  };
  const intervalId = setInterval(() => {
    if (location.hash !== "#cash") {
      return;
    }
    const targetElem = document.querySelector(`[class^=header_container__]`);
    if (!targetElem)
      return;
    const totalWrap = document.createElement("div");
    totalWrap.style.display = "flex";
    totalWrap.style.gap = "16px";
    totalWrap.style.marginBottom = "16px";
    totalWrap.append(
      Text(
        `${groupedChzInfos.reduce((total, { sum }) => sum + total, 0).toLocaleString()} 치즈`,
        { size: "24px", useChzzkFont: true }
      )
    );
    totalWrap.append(resetButton);
    container.append(totalWrap);
    container.append(div);
    const flex = document.createElement("div");
    flex.style.display = "flex";
    flex.style.gap = "16px";
    flex.style.marginTop = "16px";
    flex.append(TotalCount(groupedChzInfos));
    flex.append(heatmap(groupedChzInfos));
    container.append(flex);
    targetElem.after(container);
    clearInterval(intervalId);
  }, 200);
}
async function getChzsAfterDate(startYear, endYear, targetDateString) {
  const chzs = [];
  for (let year = startYear; year >= endYear; year--) {
    let page = 0;
    let totalPages = 10;
    while (page < totalPages) {
      const { data, totalPages: MAX } = await getPurchaseHistory(page, year);
      totalPages = MAX;
      page += 1;
      const cachedHistoryIndex = data.findIndex(
        ({ purchaseDate }) => new Date(purchaseDate).getTime() <= new Date(targetDateString).getTime()
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
async function getGroupedAllChz() {
  var _a;
  const START_YEAR = 2023;
  const TODAY_YEAR = Number((/* @__PURE__ */ new Date()).getFullYear());
  const chzs = [];
  const cachedInfoDate = (_a = getCachedInfo()) == null ? void 0 : _a.lastChzDate;
  if (cachedInfoDate) {
    chzs.push(
      ...await getChzsAfterDate(TODAY_YEAR, START_YEAR, cachedInfoDate)
    );
  } else {
    for (let year = TODAY_YEAR; year > START_YEAR; year--) {
      chzs.push(...await getChz(year, 0, true));
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
        totalDonation: 0,
        thumbnail: chz.channelImageUrl,
        name: chz.channelName
      };
      map.push(streamer);
    }
    streamer.purchases.push(chz);
    streamer.sum += chz.payAmount;
    if (chz.donationType !== DonationType.TTS) {
      streamer.totalDonation += chz.payAmount;
    }
    return map;
  }, []);
  return groupedChzInfos;
}
function newStreamer(thumbnail, name, payAmount) {
  const parser2 = new DOMParser();
  const containerRaw = `<div
    style="
    display: flex;
    font-family: Sandoll Nemony2;
    color: #444;
    gap: 4px;
    flex-shrink: 0;
    margin-right: 32px;
  "></div>`;
  const container = parser2.parseFromString(containerRaw, "text/html").body.children[0];
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
