export interface LocalAuthorityModel {
  custodianCode?: number;
  id?: number; // the id of the associated Local Authority to a given Establishment
  name: string;
  isPrimaryAuthority?: boolean;
}
