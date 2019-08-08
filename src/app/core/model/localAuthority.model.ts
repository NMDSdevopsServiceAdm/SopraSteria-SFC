export interface LocalAuthorityModel {
  custodianCode?: Number;
  id?: Number; // the id of the associated Local Authority to a given Establishment
  name: string;
  isPrimaryAuthority?: boolean;
}
