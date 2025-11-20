import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TrainingCourse } from '@core/model/training-course.model';
import { DeliveredBy } from '@core/model/training.model';
import { YesNoDontKnow } from '@core/model/YesNoDontKnow.enum';
import { TrainingCourseService } from '@core/services/training-course.service';
import { build, sequence, oneOf, BuildTimeConfig, fake } from '@jackfranklin/test-data-bot';

export const trainingCourseBuilder = build('TrainingCourse', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.datatype.uuid()),
    name: fake((f) => f.lorem.words()),
    trainingCategoryId: fake((f) => f.datatype.number({ min: 1, max: 48 })),
    trainingCategoryName: fake((f) => f.lorem.words()),
    accredited: oneOf(...Object.values(YesNoDontKnow)),
    deliveredBy: oneOf(...Object.values(DeliveredBy)),
    externalProviderName: null,
    trainingProviderId: null,
    otherTrainingProviderName: null,
    howWasItDelivered: null,
    doesNotExpire: oneOf(true),
    validityPeriodInMonth: null,
  },
}) as unknown as (buildTimeConfig?: BuildTimeConfig<any>) => TrainingCourse;

@Injectable()
export class MockTrainingCourseService extends TrainingCourseService {
  public static factory(overrides = {}) {
    return (http: HttpClient) => {
      const service = new MockTrainingCourseService(http);

      Object.keys(overrides).forEach((overrideName) => {
        service[overrideName] = overrides[overrideName];
      });

      return service;
    };
  }
}
