import { TrainingProvider } from './training-provider.model';
import { DeliveredBy, HowWasItDelivered } from './training.model';
import { YesNoDontKnow } from './YesNoDontKnow.enum';

export type TrainingCourse = {
  id: number;
  uid: string;
  trainingCategoryId: number;
  name: string;
  trainingCategoryName: string;
  accredited: YesNoDontKnow;
  deliveredBy: DeliveredBy;
  trainingProvider?: TrainingProvider;
  trainingProviderId?: number;
  externalProviderName: string;
  otherTrainingProviderName?: string;
  howWasItDelivered: HowWasItDelivered;
  doesNotExpire: boolean;
  validityPeriodInMonth: number;
};

export type GetTrainingCoursesResponse = {
  trainingCourses: Array<TrainingCourse>;
};
