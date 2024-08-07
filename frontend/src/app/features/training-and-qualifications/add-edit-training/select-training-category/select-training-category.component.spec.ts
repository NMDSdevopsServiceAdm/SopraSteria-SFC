import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectTrainingCategoryComponent } from './select-training-category.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerService, workerBuilder } from '@core/test-utils/MockWorkerService';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

describe('SelectTrainingCategoryComponent', () => {
  let component: SelectTrainingCategoryComponent;
  let fixture: ComponentFixture<SelectTrainingCategoryComponent>;

  const worker = workerBuilder();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectTrainingCategoryComponent],
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: WorkerService,
          useValue: { worker },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: new BehaviorSubject({establishmentuid: 'mock-uid', id: 'mock-id'})
          }
        }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectTrainingCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the worker name as the section heading', () => {
    const sectionHeading = fixture.debugElement.query(By.css('[data-testid="section-heading"]')).nativeElement;
    expect(sectionHeading.textContent).toContain(component.worker.nameOrId);
  });
});
