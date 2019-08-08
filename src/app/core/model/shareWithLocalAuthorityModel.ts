import { LocalAuthorityModel } from './localAuthority.model';

export interface SharingOptionsModel {
  enabled: boolean;
  name: string;
  with: Array<string>;
  authorities: LocalAuthorityModel[];
}
