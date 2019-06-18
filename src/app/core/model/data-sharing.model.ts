import { LocalAuthorityModel } from './localAuthority.model';

export interface SharingOptionsModel {
  enabled: boolean;
  name: string;
  with: Array<string>;
  authorities?: LocalAuthorityModel[];
}

export interface DataSharing {
  enabled: boolean;
  with: string[];
  authorities?: LocalAuthorityModel[];
}

export interface DataSharingRequest {
  share: DataSharing;
}

export enum DataSharingOptions {
  CQC = 'CQC',
  LOCAL = 'Local Authority',
}
