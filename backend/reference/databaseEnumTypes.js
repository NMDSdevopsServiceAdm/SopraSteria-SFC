const Enum = {
  YesNoDontKnow: ['Yes', 'No', "Don't know"],
  TrainingCourseDeliveredBy: ['In-house staff', 'External provider'],
  TrainingCourseDeliveryMode: ['Face to face', 'E-learning'],
};

const TrainingCourseDeliveredBy = {
  InHouseStaff: Enum.TrainingCourseDeliveredBy[0],
  ExternalProvider: Enum.TrainingCourseDeliveredBy[1],
};

module.exports = { Enum, TrainingCourseDeliveredBy };
