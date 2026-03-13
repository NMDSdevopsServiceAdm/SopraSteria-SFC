export interface TravelTimePayOptions {
  id: number;
  includeRate: boolean;
  label: string;
}

export interface TravelTimePayResponse {
  travelTimePayOptions: TravelTimePayOptions[];
}
