export enum SubscriptionPlan {
  FREE = 'free',
  PREMIUM = 'premium',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
}

export interface Subscription {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate?: Date;
  endDate?: Date;
  maxQrCodes: number;
  maxScansPerQr: number;
  isDynamicAllowed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlanInfo {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  plan: SubscriptionPlan;
}
