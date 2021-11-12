import { LocalAuthorityModel } from './localAuthority.model';

export interface SharingOptionsModel {
  enabled: boolean;
  name: string;
  with: Array<string>;
  authorities?: LocalAuthorityModel[];
}

export interface ShareWith {
  cqc: boolean;
  localAuthorities: boolean;
}

export interface ShareWithRequest {
  shareWith: ShareWith;
}
