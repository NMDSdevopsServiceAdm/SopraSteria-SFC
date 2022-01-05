export interface Wizard {
  id?: number;
  content?: string;
  title?: string;
  image: string;
  benchmarksFlag: boolean;
}

export interface Wizards {
  data: Wizard[];
}
