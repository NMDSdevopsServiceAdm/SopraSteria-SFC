import { of } from 'rxjs';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TrainingCourse } from '@core/model/training-course.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingCourseService } from '@core/services/training-course.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';

import { TrainingCourseResolver, TrainingCoursesToLoad } from './training-course.resolver';

@Component({ template: '' })
class MockComponentForTest {
  constructor(public route: ActivatedRoute) {}
}

describe('trainingCourseResolver', () => {
  const mockEstablishmentUid = 'mock-uid';
  const baseRoute = `workplace/${mockEstablishmentUid}`;
  const mockTrainingCoursesFromBackend = [{ id: 1, name: 'mockTrainingCourse' }] as TrainingCourse[];

  async function setup(overrides: any = {}) {
    const permissions = overrides?.permissions ?? ['canViewWorker'];
    const trainingCoursesFromBackend = overrides?.trainingCoursesFromBackend ?? mockTrainingCoursesFromBackend;
    const snapshotData = overrides?.snapshotData ?? { title: 'Mock page title' };
    const mockTrainingRecordResolver = jasmine.createSpy();

    const mockRoutes = [
      {
        path: 'workplace/:establishmentuid',
        children: [
          {
            path: '',
            component: MockComponentForTest,
            resolve: { trainingCourses: TrainingCourseResolver },
            data: snapshotData,
          },
          {
            path: 'add-a-training-record',
            component: MockComponentForTest,
            data: {
              title: 'Add a Training Record', // select a course or continue without course
              trainingCoursesToLoad: TrainingCoursesToLoad.BY_QUERY_PARAM,
              redirectWhenNoCourses: ['../add-training-without-course'],
            },
            resolve: { trainingCourses: TrainingCourseResolver },
          },
          {
            path: 'add-training-without-course',
            children: [
              {
                path: '',
                component: MockComponentForTest,
                data: { title: 'Add Training' }, // continue without course
              },
            ],
          },
          {
            path: 'training/:trainingRecordId',
            resolve: { trainingRecord: mockTrainingRecordResolver },
            children: [
              {
                path: '',
                component: MockComponentForTest,
                data: {
                  title: 'Training',
                  trainingCoursesToLoad: TrainingCoursesToLoad.BY_TRAINING_RECORD_CATEGORY_ID,
                },
                resolve: {
                  trainingCourses: TrainingCourseResolver,
                },
              },
            ],
          },
          {
            path: 'page-to-show-when-no-training-course',
            component: MockComponentForTest,
          },
        ],
      },
    ];

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(mockRoutes),
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(permissions, false),
        },
      ],
    });

    const resolver = TestBed.inject(TrainingCourseResolver);
    const route = TestBed.inject(ActivatedRoute);
    const router = TestBed.inject(Router);

    const harness = await RouterTestingHarness.create();

    const trainingCourseService = TestBed.inject(TrainingCourseService);
    const getAllTrainingCoursesSpy = spyOn(trainingCourseService, 'getAllTrainingCourses').and.returnValue(
      of(trainingCoursesFromBackend),
    );
    const getTrainingCoursesByCategorySpy = spyOn(
      trainingCourseService,
      'getTrainingCoursesByCategory',
    ).and.returnValue(of(trainingCoursesFromBackend));

    return {
      harness,
      route,
      router,
      resolver,
      getAllTrainingCoursesSpy,
      getTrainingCoursesByCategorySpy,
      mockTrainingRecordResolver,
    };
  }

  it('should be created', async () => {
    const { resolver } = await setup();
    expect(resolver).toBeTruthy();
  });

  it('should call getAllTrainingCourses by default', async () => {
    const { harness, getAllTrainingCoursesSpy, getTrainingCoursesByCategorySpy } = await setup();

    const component = await harness.navigateByUrl(baseRoute, MockComponentForTest);

    expect(getAllTrainingCoursesSpy).toHaveBeenCalledWith(mockEstablishmentUid);
    expect(getTrainingCoursesByCategorySpy).not.toHaveBeenCalled();

    expect(component.route.snapshot.data.trainingCourses).toEqual(mockTrainingCoursesFromBackend);
  });

  it('should call getAllTrainingCourses if trainingCoursesToLoad is "ALL"', async () => {
    const { harness, getAllTrainingCoursesSpy, getTrainingCoursesByCategorySpy } = await setup({
      snapshotData: { trainingCoursesToLoad: 'ALL' },
    });

    const component = await harness.navigateByUrl(baseRoute, MockComponentForTest);

    expect(getAllTrainingCoursesSpy).toHaveBeenCalledWith(mockEstablishmentUid);
    expect(getTrainingCoursesByCategorySpy).not.toHaveBeenCalled();

    expect(component.route.snapshot.data.trainingCourses).toEqual(mockTrainingCoursesFromBackend);
  });

  it('should not make call to backend if the user does not have canViewWorker permission', async () => {
    const { harness, getAllTrainingCoursesSpy, getTrainingCoursesByCategorySpy } = await setup({
      permissions: [],
    });

    const component = await harness.navigateByUrl(baseRoute, MockComponentForTest);

    expect(getAllTrainingCoursesSpy).not.toHaveBeenCalled();
    expect(getTrainingCoursesByCategorySpy).not.toHaveBeenCalled();

    expect(component.route.snapshot.data.trainingCourses).toEqual([]);
  });

  describe('when use with trainingCoursesToLoad: BY_TRAINING_RECORD_CATEGORY_ID', async () => {
    const mockTrainingRecord = {
      id: '1',
      title: 'some mock training record',
      trainingCategory: {
        id: 10,
      },
    };

    it('should call getTrainingCoursesByCategory with the category id of training record', async () => {
      const { harness, getAllTrainingCoursesSpy, getTrainingCoursesByCategorySpy, mockTrainingRecordResolver } =
        await setup();

      mockTrainingRecordResolver.and.resolveTo(mockTrainingRecord);

      const component = await harness.navigateByUrl(
        `${baseRoute}/training/mock-training-record-uid`,
        MockComponentForTest,
      );

      expect(getAllTrainingCoursesSpy).not.toHaveBeenCalled();
      expect(getTrainingCoursesByCategorySpy).toHaveBeenCalledWith(
        mockEstablishmentUid,
        mockTrainingRecord.trainingCategory.id,
      );

      expect(component.route.snapshot.data.trainingCourses).toEqual(mockTrainingCoursesFromBackend);
    });

    it('should just call getAllTrainingCourses if category id is missing', async () => {
      const { harness, getAllTrainingCoursesSpy, getTrainingCoursesByCategorySpy, mockTrainingRecordResolver } =
        await setup();

      mockTrainingRecordResolver.and.resolveTo({});

      const component = await harness.navigateByUrl(
        `${baseRoute}/training/mock-training-record-uid`,
        MockComponentForTest,
      );

      expect(getAllTrainingCoursesSpy).toHaveBeenCalledWith(mockEstablishmentUid);
      expect(getTrainingCoursesByCategorySpy).not.toHaveBeenCalled();

      expect(component.route.snapshot.data.trainingCourses).toEqual(mockTrainingCoursesFromBackend);
    });
  });

  describe('redirectWhenNoCourses', () => {
    it('should redirect to a given page if "redirectWhenNoCourses" is defined in route and no training course was found', async () => {
      const { router, harness, getAllTrainingCoursesSpy } = await setup({
        snapshotData: {
          redirectWhenNoCourses: ['page-to-show-when-no-training-course'],
        },
        trainingCoursesFromBackend: [],
      });

      await harness.navigateByUrl(baseRoute, MockComponentForTest);

      expect(getAllTrainingCoursesSpy).toHaveBeenCalled();

      expect(router.url).toEqual(`/${baseRoute}/page-to-show-when-no-training-course`);
    });

    it('should ignore "redirectWhenNoCourses" and not to redirect if there are some training courses in the backend response', async () => {
      const { router, harness, getAllTrainingCoursesSpy } = await setup({
        snapshotData: {
          redirectWhenNoCourses: ['page-to-show-when-no-training-course'],
        },
        trainingCoursesFromBackend: mockTrainingCoursesFromBackend,
      });

      const component = await harness.navigateByUrl(baseRoute, MockComponentForTest);

      expect(getAllTrainingCoursesSpy).toHaveBeenCalled();

      expect(router.url).toEqual(`/${baseRoute}`);
      expect(component.route.snapshot.data.trainingCourses).toEqual(mockTrainingCoursesFromBackend);
    });
  });

  describe('when use with trainingCoursesToLoad: BY_QUERY_PARAM', async () => {
    const mockQueryParamSuffix = `?trainingCategory=${JSON.stringify({ category: 'Autism', id: 2 })}`;

    it('should call getTrainingCoursesByCategory with the category id from query param', async () => {
      const { harness, getAllTrainingCoursesSpy, getTrainingCoursesByCategorySpy } = await setup();

      const component = await harness.navigateByUrl(
        `${baseRoute}/add-a-training-record${mockQueryParamSuffix}`,
        MockComponentForTest,
      );

      expect(getAllTrainingCoursesSpy).not.toHaveBeenCalled();
      expect(getTrainingCoursesByCategorySpy).toHaveBeenCalledWith(mockEstablishmentUid, 2);
      expect(component.route.snapshot.data.trainingCourses).toEqual(mockTrainingCoursesFromBackend);
    });

    it('should just call getAllTrainingCourses if category id is missing', async () => {
      const { router, harness, getAllTrainingCoursesSpy, getTrainingCoursesByCategorySpy } = await setup();

      const component = await harness.navigateByUrl(`${baseRoute}/add-a-training-record`, MockComponentForTest);

      expect(getAllTrainingCoursesSpy).toHaveBeenCalledWith(mockEstablishmentUid);
      expect(getTrainingCoursesByCategorySpy).not.toHaveBeenCalled();

      expect(router.url).toEqual(`/${baseRoute}/add-a-training-record`);
      expect(component.route.snapshot.data.trainingCourses).toEqual(mockTrainingCoursesFromBackend);
    });

    it('should redirect if "redirectWhenNoCourses" is given and there are no training courses in the specific category', async () => {
      // note: redirectWhenNoCourses is configured in routes in setup function
      const { harness, router, getAllTrainingCoursesSpy, getTrainingCoursesByCategorySpy } = await setup({
        trainingCoursesFromBackend: [],
      });

      await harness.navigateByUrl(`${baseRoute}/add-a-training-record`, MockComponentForTest);

      expect(getAllTrainingCoursesSpy).toHaveBeenCalledWith(mockEstablishmentUid);
      expect(getTrainingCoursesByCategorySpy).not.toHaveBeenCalled();
      expect(router.url).toEqual(`/${baseRoute}/add-training-without-course`);
    });
  });
});
