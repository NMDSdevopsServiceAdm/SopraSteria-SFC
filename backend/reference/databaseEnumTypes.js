const Enum = {
  YesNoDontKnow: ['Yes', 'No', "Don't know"],
  TrainingCourseDeliveredBy: ['In-house staff', 'External provider'],
  TrainingCourseDeliveryMode: ['Face to face', 'E-learning'],
};

const TrainingCourseDeliveredBy = {
  InHouseStaff: Enum.TrainingCourseDeliveredBy[0],
  ExternalProvider: Enum.TrainingCourseDeliveredBy[1],
};

const TrainingCourseDeliveryMode = {
  FaceToFace: Enum.TrainingCourseDeliveryMode[0],
  ELearning: Enum.TrainingCourseDeliveryMode[1],
};

const WorkerCareCertificate = {
  YesCompleted: 'Yes, completed',
  YesInProgress: 'Yes, in progress or partially completed',
  No: 'No',
};

const WorkerLevel2CareCertificate = {
  YesCompleted: 'Yes, completed',
  YesStarted: 'Yes, started',
  No: 'No',
};

const WorkerSocialCareQualificationLevel = {
  EntryLevel: 'Entry level',
  Level1: 'Level 1',
  Level2: 'Level 2',
  Level3: 'Level 3',
  Level4: 'Level 4',
  Level5: 'Level 5',
  Level6: 'Level 6',
  Level7: 'Level 7',
  Level8OrAbove: 'Level 8 or above',
  DontKnow: "Don't know",

  // The below two options does not exist in database. only for purpose of excel report.
  Level2OrAbove: 'Level 2 or above',
  Level5OrAbove: 'Level 5 or above',
};

module.exports = {
  Enum,
  TrainingCourseDeliveredBy,
  TrainingCourseDeliveryMode,
  WorkerCareCertificate,
  WorkerLevel2CareCertificate,
  WorkerSocialCareQualificationLevel,
};
