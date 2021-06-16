export enum EmailType {
  'InactiveWorkplaces',
  'TargetedEmails',
}

export interface TotalEmailsResponse {
  totalEmails: number;
}

export interface Template {
  id: number;
  name: string;
}

export interface TemplatesResponse {
  templates: Template[];
}
