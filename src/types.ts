export interface ProfileData {
  title: string;
  subtitle: string;
  looksmaxxingRating: string;
  avatarImage: string | null;
  avatarScale: number;
  avatarOffsetX: number;
  avatarOffsetY: number;
  authorityScore: number;
  vocalAgeScore: number;
  potentialScore: number;
  baselineFrequency: number;
  voiceClassification: string;
  depthRating: string;
  trainingStatus: string;

  // Blackpill Mode Specifics (Hz Focused)
  hzValue: string;
  percentile: string;
  masculinityScore: number;
  cortisolLevel: string;
  ratingSubtitle: string;
  useIphoneFrame: boolean;
}

export type DashboardMode = 'standard' | 'blackpill' | 'testVoice';
