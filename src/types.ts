export type PurchaseHistory = {
  channelId: string;
  channelImageUrl: string;
  channelName: string;
  donationText: string;
  donationType: DonationType;
  donationVideoType: null | string;
  donationVideoUrl: string;
  extras: unknown;
  payAmount: number;
  purchaseDate: string;
  useSpeech: boolean;
};

export type StreamerSummary = {
  id: string;
  name: string;
  purchases: PurchaseHistory[];
  sum: number;
  totalDonation: number;
  thumbnail: string;
};

export enum DonationType {
  CHAT = 'CHAT',
  VIDEO = 'VIDEO',
  MISSION = 'MISSION',
  TTS = 'TTS',
}
