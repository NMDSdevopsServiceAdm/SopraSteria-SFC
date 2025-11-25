import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TrainingCourse } from '@core/model/training-course.model';
import { DeliveredBy, TrainingCategory } from '@core/model/training.model';
import { TrainingCourseService } from '@core/services/training-course.service';
import { build, sequence, oneOf, BuildTimeConfig, fake } from '@jackfranklin/test-data-bot';
import { trainingCategories } from '@core/test-utils/MockTrainingCategoriesService';

export const trainingCourseBuilder = build('TrainingCourse', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.datatype.uuid()),
    name: fake((f) => f.lorem.words()),
    trainingCategory: oneOf(...trainingCategories),
    trainingCategoryName: null,
    trainingCategoryId: null,
    accredited: oneOf('Yes', 'No'),
    deliveredBy: oneOf(...Object.values(DeliveredBy)),
    externalProviderName: null,
    trainingProviderId: null,
    otherTrainingProviderName: null,
    howWasItDelivered: null,
    doesNotExpire: oneOf(true),
    validityPeriodInMonth: null,
  },
  postBuild: (trainingCourse) => {
    trainingCourse.trainingCategoryName = (trainingCourse.trainingCategory as TrainingCategory).category;
    trainingCourse.trainingCategoryId = (trainingCourse.trainingCategory as TrainingCategory).id;
    return trainingCourse;
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
