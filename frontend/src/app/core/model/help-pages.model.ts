export interface HelpPage {
  id?: number;
  status?: string;
  user_created?: string;
  date_created?: Date;
  user_updated?: string;
  date_updated?: Date;
  content?: string;
  title?: string;
  publish_date?: Date;
  slug?: string;
  link_title?: string;
}

export interface HelpPages {
  data: HelpPage[];
}

export interface QuestionAndAnswerPage extends HelpPage {}

interface SubSection {
  sub_section_heading: string;
  q_and_a_pages: QuestionAndAnswerPage[];
}

interface Section {
  section_heading: string;
  sub_sections: SubSection[];
  q_and_a_pages: QuestionAndAnswerPage[];
}

export type QuestionsAndAnswersResponse = Section[];
