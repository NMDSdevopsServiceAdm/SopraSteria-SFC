export interface Qualification {
    id: number;
    uid?: string;
    code?: number;
    from?: string;
    until?: string;
    level?: string;
    title?: string;
    group?: string;
    year?: number;
    notes?: string;
    qualification?: {
      title?: string;
      group?: string;
    };
  }