import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, RedirectCommand } from '@angular/router';

import { TrainingCourseResolver } from './training-course.resolver';
import { TrainingCourseService } from '@core/services/training-course.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { of } from 'rxjs';
import { TrainingCourse } from '@core/model/training-course.model';

fdescribe('trainingCourseResolver', () => {
  const mockEstablishmentUid = 'mock-uid';

  const mockParentWithTrainingCategoryId = {
    data: {
      trainingRecord: {
        trainingCategory: {
          id: 10,
        },
      },
    },
  };

  const mockTrainingCoursesFromBackend = [{ id: 1, name: 'mockTrainingCourse' }] as TrainingCourse[];

  function setup(overrides: any = {}) {
    const permissions = overrides?.permissions ?? ['canViewWorker'];
    const trainingCoursesFromBackend = overrides?.trainingCoursesFromBackend ?? mockTrainingCoursesFromBackend;
    const snapshotData = { title: 'Mock page title' };
    if (overrides?.redirectWhenNoCourses) {
      snapshotData['redirectWhenNoCourses'] = overrides.redirectWhenNoCourses;
    }

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
              data: snapshotData,
              paramMap: convertToParamMap({ establishmentuid: mockEstablishmentUid }),
              parent: overrides?.parent,
            },
          },
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(permissions, false),
        },
        TrainingCourseResolver,
        TrainingCourseService,
      ],
    });

    const resolver = TestBed.inject(TrainingCourseResolver);
    const route = TestBed.inject(ActivatedRoute);

    const trainingCourseService = TestBed.inject(TrainingCourseService);
    const getAllTrainingCoursesSpy = spyOn(trainingCourseService, 'getAllTrainingCourses').and.returnValue(
      of(trainingCoursesFromBackend),
    );
    const getTrainingCoursesByCategorySpy = spyOn(
      trainingCourseService,
      'getTrainingCoursesByCategory',
    ).and.returnValue(of(trainingCoursesFromBackend));

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

  it('should call getAllTrainingCourses by default', async () => {
    const { resolver, route, getAllTrainingCoursesSpy, getTrainingCoursesByCategorySpy } = setup();

    const result = await resolver.resolve(route.snapshot);

    expect(getAllTrainingCoursesSpy).toHaveBeenCalledWith(mockEstablishmentUid);
    expect(getTrainingCoursesByCategorySpy).not.toHaveBeenCalled();

    expect(result).toEqual(mockTrainingCoursesFromBackend);
  });

  it('should call getAllTrainingCourses if trainingCoursesToLoad is "ALL"', async () => {
    const { resolver, route, getAllTrainingCoursesSpy, getTrainingCoursesByCategorySpy } = setup();

    route.snapshot.data = { trainingCoursesToLoad: 'ALL' };
    const result = await resolver.resolve(route.snapshot);

    expect(getAllTrainingCoursesSpy).toHaveBeenCalledWith(mockEstablishmentUid);
    expect(getTrainingCoursesByCategorySpy).not.toHaveBeenCalled();

    expect(result).toEqual(mockTrainingCoursesFromBackend);
  });

  it('should call getTrainingCoursesByCategorySpy if there is a training categoryId', async () => {
    const { resolver, route, getAllTrainingCoursesSpy, getTrainingCoursesByCategorySpy } = setup({
      parent: mockParentWithTrainingCategoryId,
    });
    const result = await resolver.resolve(route.snapshot);

    expect(getAllTrainingCoursesSpy).not.toHaveBeenCalled();
    expect(getTrainingCoursesByCategorySpy).toHaveBeenCalledWith(mockEstablishmentUid, 10);

    expect(result).toEqual(mockTrainingCoursesFromBackend);
  });

  it('should not make call to backend if the user does not have canViewWorker permission', async () => {
    const { resolver, route, getAllTrainingCoursesSpy, getTrainingCoursesByCategorySpy } = setup({
      permissions: [],
    });
    const result = await resolver.resolve(route.snapshot);

    expect(getAllTrainingCoursesSpy).not.toHaveBeenCalled();
    expect(getTrainingCoursesByCategorySpy).not.toHaveBeenCalled();

    expect(result).toEqual([]);
  });

  describe('when backend call return with an empty array', () => {
    it('should redirect to a specific page if "redirectWhenNoCourses" is defined in route', async () => {
      const { resolver, route, getAllTrainingCoursesSpy } = setup({
        redirectWhenNoCourses: ['/page-to-show-when-no-training-course'],
        trainingCoursesFromBackend: [],
      });

      const result = await resolver.resolve(route.snapshot);

      expect(getAllTrainingCoursesSpy).toHaveBeenCalled();

      expect(result).toBeInstanceOf(RedirectCommand);
      expect((result as RedirectCommand).redirectTo.toString()).toEqual('/page-to-show-when-no-training-course');
    });

    it('should redirect to a specific page if "redirectWhenNoCourses" is defined in route (with category id given)', async () => {
      const { resolver, route, getTrainingCoursesByCategorySpy } = setup({
        redirectWhenNoCourses: ['/page-to-show-when-no-training-course'],
        trainingCoursesFromBackend: [],
        parent: mockParentWithTrainingCategoryId,
      });

      const result = await resolver.resolve(route.snapshot);

      expect(getTrainingCoursesByCategorySpy).toHaveBeenCalled();

      expect(result).toBeInstanceOf(RedirectCommand);
      expect((result as RedirectCommand).redirectTo.toString()).toEqual('/page-to-show-when-no-training-course');
    });

    it('should just return an empty array [] if redirectWhenNoCourses is not defined', async () => {
      const { resolver, route } = setup({
        trainingCoursesFromBackend: [],
      });

      const result = await resolver.resolve(route.snapshot);

      expect(result).toEqual([]);
    });
  });

  it('should ignore redirectWhenNoCourses if backend return with some training courses', async () => {
    const { resolver, route, getAllTrainingCoursesSpy } = setup({
      redirectWhenNoCourses: ['/page-to-show-when-no-training-course'],
      trainingCoursesFromBackend: mockTrainingCoursesFromBackend,
    });

    const result = await resolver.resolve(route.snapshot);

    expect(getAllTrainingCoursesSpy).toHaveBeenCalled();

    expect(result).toEqual(mockTrainingCoursesFromBackend);
  });

  it('should ignore redirectWhenNoCourses if backend return with some training courses (with category id given)', async () => {
    const { resolver, route, getTrainingCoursesByCategorySpy } = setup({
      redirectWhenNoCourses: ['/page-to-show-when-no-training-course'],
      parent: mockParentWithTrainingCategoryId,
      trainingCoursesFromBackend: mockTrainingCoursesFromBackend,
    });

    const result = await resolver.resolve(route.snapshot);

    expect(getTrainingCoursesByCategorySpy).toHaveBeenCalled();

    expect(result).toEqual(mockTrainingCoursesFromBackend);
  });
});
