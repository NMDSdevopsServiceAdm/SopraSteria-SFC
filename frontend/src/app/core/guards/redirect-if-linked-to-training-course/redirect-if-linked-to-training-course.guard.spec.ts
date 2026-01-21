import { of } from 'rxjs';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, CanActivateFn, provideRouter, UrlTree } from '@angular/router';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';

import { redirectIfLinkedToTrainingCourse } from './redirect-if-linked-to-training-course.guard';

describe('redirectIfLinkedToTrainingCourseGuard', () => {
  async function setup() {
    const guard: CanActivateFn = (...guardParameters) =>
      TestBed.runInInjectionContext(() => redirectIfLinkedToTrainingCourse(...guardParameters));

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: WorkerService, useClass: MockWorkerService },
      ],
    });

    const workerService = TestBed.inject(WorkerService);
    const route = TestBed.inject(ActivatedRoute);
    const getTrainingRecordSpy = spyOn(workerService, 'getTrainingRecord');
    return { guard, route, getTrainingRecordSpy };
  }

  it('should be created', async () => {
    const { guard } = await setup();
    expect(guard).toBeTruthy();
  });

  const notMatchedWithCourse = { id: '1', title: 'mock training record', isMatchedToTrainingCourse: false };
  const matchedWithCourse = { id: '2', title: 'mock training record 2', isMatchedToTrainingCourse: true };

  it('should return true if training record is not matched to a course', async () => {
    const { guard, route, getTrainingRecordSpy } = await setup();

    getTrainingRecordSpy.and.returnValue(of(notMatchedWithCourse));
    const result = await guard(route.snapshot, null);

    expect(result).toBeTrue();
  });

  it('should return a redirect url if training record is matched to a course', async () => {
    const { guard, route, getTrainingRecordSpy } = await setup();

    getTrainingRecordSpy.and.returnValue(of(matchedWithCourse));
    route.snapshot.data = { routeForTrainingRecordWithCourse: ['./page-to-show-when-linked-to-training-course'] };
    const result = await guard(route.snapshot, null);

    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toEqual('/page-to-show-when-linked-to-training-course');
  });

  it('should just return true if routeForTrainingRecordWithCourse is not provided', async () => {
    const { guard, route, getTrainingRecordSpy } = await setup();

    getTrainingRecordSpy.and.returnValue(of(matchedWithCourse));
    route.snapshot.data = {};
    const result = await guard(route.snapshot, null);

    expect(result).toBeTrue();
  });
});
