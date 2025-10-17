import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { TrainingCourseResolver } from './training-course.resolver';
import { TrainingCourseService } from '@core/services/training-course.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

fdescribe('trainingCourseResolver', () => {
  const mockEstablishmentUid = 'mock-uid';

  function setup() {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        TrainingCourseResolver,
        TrainingCourseService,
      ],
    });

    const resolver = TestBed.inject(TrainingCourseResolver);
    const route = TestBed.inject(ActivatedRoute);

    spyOnProperty(route.snapshot, 'paramMap', 'get').and.returnValue(
      convertToParamMap({ establishmentuid: mockEstablishmentUid }),
    );

    const trainingCourseService = TestBed.inject(TrainingCourseService);
    const getAllTrainingCoursesSpy = spyOn(trainingCourseService, 'getAllTrainingCourses').and.callThrough();
    const getTrainingCoursesByCategorySpy = spyOn(
      trainingCourseService,
      'getTrainingCoursesByCategory',
    ).and.callThrough();

    return {
      route,
      resolver,
      getAllTrainingCoursesSpy,
      getTrainingCoursesByCategorySpy,
    };
  }

  it('should be created', () => {
    const { resolver } = setup();
    expect(resolver).toBeTruthy();
  });

  it('should call getAllTrainingCourses by default', () => {
    const { resolver, route, getAllTrainingCoursesSpy, getTrainingCoursesByCategorySpy } = setup();

    resolver.resolve(route.snapshot);

    expect(getAllTrainingCoursesSpy).toHaveBeenCalledWith(mockEstablishmentUid);
    expect(getTrainingCoursesByCategorySpy).not.toHaveBeenCalled();
  });

  it('should call getAllTrainingCourses if trainingCoursesToLoad is "ALL"', () => {
    const { resolver, route, getAllTrainingCoursesSpy, getTrainingCoursesByCategorySpy } = setup();

    route.snapshot.data = { trainingCoursesToLoad: 'ALL' };
    resolver.resolve(route.snapshot);

    expect(getAllTrainingCoursesSpy).toHaveBeenCalledWith(mockEstablishmentUid);
    expect(getTrainingCoursesByCategorySpy).not.toHaveBeenCalled();
  });

  it('should call getTrainingCoursesByCategorySpy if trainingCoursesToLoad is "ALL"', () => {
    const { resolver, route, getAllTrainingCoursesSpy, getTrainingCoursesByCategorySpy } = setup();

    route.snapshot.data = { trainingCoursesToLoad: { categoryId: 10 } };
    resolver.resolve(route.snapshot);

    expect(getAllTrainingCoursesSpy).not.toHaveBeenCalled();
    expect(getTrainingCoursesByCategorySpy).toHaveBeenCalledWith(mockEstablishmentUid, 10);
  });
});
