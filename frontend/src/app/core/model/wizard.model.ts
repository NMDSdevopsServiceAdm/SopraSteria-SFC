export interface Wizard {
  id?: number;
  content?: string;
  title?: string;
  image: string;
  video?: string;
  benchmarksFlag: boolean;
}

export interface Wizards {
  data: Wizard[];
}
