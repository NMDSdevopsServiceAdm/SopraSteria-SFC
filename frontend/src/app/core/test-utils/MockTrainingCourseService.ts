import { Injectable } from '@angular/core';
import { TrainingCourse } from '@core/model/training-course.model';
import { TrainingCourseService } from '@core/services/training-course.service';
import { build, sequence, oneOf, BuildTimeConfig, fake } from '@jackfranklin/test-data-bot';

export const trainingCourseBuilder = build('TrainingCourse', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.datatype.uuid()),
    trainingCategoryId: fake((f) => f.datatype.number({ min: 1, max: 48 })),
    name: fake((f) => f.lorem.words()),
    accredited: oneOf('Yes', 'No', "Don't know"),
    deliveredBy: oneOf('In-house staff', 'External provider'),
    externalProviderName: null,
    howWasItDelivered: null,
    doesNotExpire: oneOf(false),
    validityPeriodInMonth: null,
  },
}) as unknown as (buildTimeConfig?: BuildTimeConfig<any>) => TrainingCourse;

@Injectable()
export class MockTrainingCourseService extends TrainingCourseService {}
