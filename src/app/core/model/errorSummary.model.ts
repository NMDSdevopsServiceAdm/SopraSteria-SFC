export interface ErrorSummary {
  formControlName: string;
  errors: Array<string>;
}

export interface ErrorDetails {
  formControlName: string;
  type: Array<ErrorDefinition>;
}

export interface ErrorDefinition {
  name: string;
  message: string;
}
