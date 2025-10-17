export type TrainingCourse = {
  id: number;
  uid: string;
  trainingCategoryId: number;
  name: string;
  accredited: 'Yes' | 'No' | "Don't know";
  deliveredBy: 'In-house staff' | 'External provider';
  externalProviderName: string;
  howWasItDelivered: 'Face to face' | 'Online';
  doesNotExpire: boolean;
  validityPeriodInMonth: number;
};

export type GetTrainingCoursesResponse = {
  trainingCourses: Array<TrainingCourse>;
};
