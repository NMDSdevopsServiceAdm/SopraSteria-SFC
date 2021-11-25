export interface Wizard {
  id?: number;
  content?: string;
  title?: string;
  slug?: string;
  order: number;
  benchmarksFlag: boolean;
}

export interface Wizard {
  data: Wizard[];
}
