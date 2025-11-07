import { DeliveredBy, HowWasItDelivered } from './training.model';
import { YesNoDontKnow } from './YesNoDontKnow.enum';

export type TrainingCourse = {
  id: number;
  uid: string;
  trainingCategoryId: number;
  trainingCategoryName: string;
  name: string;
  accredited: YesNoDontKnow;
  deliveredBy: DeliveredBy;
  externalProviderName: string;
  howWasItDelivered: HowWasItDelivered;
  doesNotExpire: boolean;
  validityPeriodInMonth: number;
};

export type GetTrainingCoursesResponse = {
  trainingCourses: Array<TrainingCourse>;
};
