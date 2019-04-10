export interface ErrorSummary {
  item: string;
  errors: Array<string>;
}

export interface ErrorDetails {
  item: string;
  type: Array<ErrorDefinition>;
}

export interface ErrorDefinition {
  name: string | number;
  message: string;
}
