import { TrainingProvider } from './training-provider.model';
import { DeliveredBy, HowWasItDelivered, TrainingRecord } from './training.model';
import { YesNoDontKnow } from './YesNoDontKnow.enum';

export type TrainingCourse = {
  id: number;
  uid: string;
  trainingCategoryId: number;
  name: string;
  trainingCategoryName?: string;
  accredited: YesNoDontKnow;
  deliveredBy: DeliveredBy;
  trainingProvider?: TrainingProvider;
  trainingProviderId?: number;
  externalProviderName?: string;
  otherTrainingProviderName?: string;
  howWasItDelivered: HowWasItDelivered;
  doesNotExpire: boolean;
  category?: {
    id?: number;
    seq?: number;
    category?: string;
    trainingCategoryGroup?: string;
  };
  validityPeriodInMonth: number;
};

export type GetTrainingCoursesResponse = {
  trainingCourses: Array<TrainingCourse>;
};

export type TrainingCourseWithLinkableRecords = TrainingCourse & { linkableTrainingRecords: Array<TrainingRecord> };

export type GetTrainingCoursesWithLinkableRecordsResponse = {
  trainingCourses: Array<TrainingCourseWithLinkableRecords>;
};
