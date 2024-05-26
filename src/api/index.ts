import { PurchaseHistory } from '@/types';
import { delay } from '@/utils/delay';

export async function getChz(
  year: number,
  pg: number,
  getAll: boolean = false,
): Promise<PurchaseHistory[]> {
  const { page, totalPages, data } = await getPurchaseHistory(pg, year);
  const hasMorePages = page + 1 < totalPages;
  let nextPurchaseInfoPages: PurchaseHistory[] = [];
  if (getAll && hasMorePages) {
    await delay(100);
    nextPurchaseInfoPages = await getChz(year, page + 1, getAll);
  }
  return data.concat(nextPurchaseInfoPages);
}

export async function getPurchaseHistory(
  pg: number,
  year: number,
): Promise<{
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
  data: PurchaseHistory[];
}> {
  const res = await fetch(
    `https://api.chzzk.naver.com/commercial/v1/product/purchase/history?page=${pg}&size=10&searchYear=${year}`,
    {
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6',
      },
      method: 'GET',
      credentials: 'include',
    },
  );
  const json = await res.json();
  return json.content;
}
