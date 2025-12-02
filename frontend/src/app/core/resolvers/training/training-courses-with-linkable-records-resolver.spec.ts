import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { TrainingCoursesWithLinkableRecordsResolver } from './training-courses-with-linkable-records-resolver';
import { TrainingCourseService } from '@core/services/training-course.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

fdescribe('TrainingCoursesWithLinkableRecordsResolver', () => {
  const mockEstablishmentUid = 'mock-uid';

  function setup(overrides: any = {}) {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ establishmentuid: mockEstablishmentUid }),
            },
          },
        },
        TrainingCoursesWithLinkableRecordsResolver,
        TrainingCourseService,
      ],
    });

    const resolver = TestBed.inject(TrainingCoursesWithLinkableRecordsResolver);
    const route = TestBed.inject(ActivatedRoute);

    const trainingCourseService = TestBed.inject(TrainingCourseService);

    return {
      route,
      resolver,
      trainingCourseService,
    };
  }

  it('should be created', () => {
    const { resolver } = setup();
    expect(resolver).toBeTruthy();
  });

  it('should call getTrainingCoursesWithLinkableRecords with establishment uid', () => {
    const { resolver, route, trainingCourseService } = setup();
    const getTrainingCoursesWithLinkableRecordsSpy = spyOn(
      trainingCourseService,
      'getTrainingCoursesWithLinkableRecords',
    ).and.callThrough();

    resolver.resolve(route.snapshot);

    expect(getTrainingCoursesWithLinkableRecordsSpy).toHaveBeenCalledWith(mockEstablishmentUid);
  });
});
