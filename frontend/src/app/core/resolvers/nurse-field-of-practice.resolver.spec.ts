import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { AllNurseFieldsOfPracticeResolver } from './nurse-field-of-practice.resolver';
import { WorkerService } from '@core/services/worker.service';

describe('AllNurseFieldsOfPracticeResolver', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [],
      providers: [AllNurseFieldsOfPracticeResolver, WorkerService, provideHttpClient(), provideHttpClientTesting()],
    });

    const resolver = TestBed.inject(AllNurseFieldsOfPracticeResolver);
    const workerService = TestBed.inject(WorkerService);

    const getAllNurseFieldsOfPracticeSpy = spyOn(workerService, 'getAllNurseFieldsOfPractice').and.returnValue(of([]));

    return {
      resolver,
      workerService,
      getAllNurseFieldsOfPracticeSpy,
    };
  }

  it('should create', () => {
    const { resolver } = setup();
    expect(resolver).toBeTruthy();
  });

  it('should call getDelegatedHealthcareActivities', () => {
    const { resolver, getAllNurseFieldsOfPracticeSpy } = setup();

    resolver.resolve();

    expect(getAllNurseFieldsOfPracticeSpy).toHaveBeenCalled();
  });
});
