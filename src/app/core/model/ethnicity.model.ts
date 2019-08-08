export interface Ethnicity {
  id: number;
  ethnicity: string;
  group?: string;
}

export interface EthnicityResponse {
  list: Ethnicity[];
  byGroup: { [key: string]: Ethnicity[] };
}

export interface EthnicityFullResponse {
  ethnicities: EthnicityResponse;
}
