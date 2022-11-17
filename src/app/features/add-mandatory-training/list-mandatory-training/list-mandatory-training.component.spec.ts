import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';

import { ListMandatoryTrainingComponent } from './list-mandatory-training.component';

describe('NewTrainingComponent', () => {
  let component: ListMandatoryTrainingComponent;
  let fixture: ComponentFixture<ListMandatoryTrainingComponent>;

  const existingMandatoryTrainings = {
    mandatoryTrainingCount: 4,
    allJobRolesCount: 29,
    lastUpdated: '2022-11-16T14:26:03.651Z',
    mandatoryTraining: [
      {
        establishmentId: 2341,
        trainingCategoryId: 3,
        category: "Childrens / young people's related training",
        jobs: [
          {
            id: 9,
            title: 'Care navigator',
          },
          {
            id: 2,
            title: 'Administrative, office staff (non care-providing)',
          },
        ],
      },
      {
        establishmentId: 2341,
        trainingCategoryId: 9,
        category: 'Coshh',
        jobs: [
          {
            id: 21,
            title: 'Other (not directly involved in providing care)',
          },
          {
            id: 20,
            title: 'Other (directly involved in providing care)',
          },
          {
            id: 29,
            title: 'Technician',
          },
          {
            id: 28,
            title: 'Supervisor',
          },
          {
            id: 27,
            title: 'Social worker',
          },
          {
            id: 26,
            title: 'Senior management',
          },
          {
            id: 25,
            title: 'Senior care worker',
          },
          {
            id: 24,
            title: 'Safeguarding and reviewing officer',
          },
          {
            id: 23,
            title: 'Registered Nurse',
          },
          {
            id: 22,
            title: 'Registered Manager',
          },
          {
            id: 19,
            title: 'Occupational therapist assistant',
          },
          {
            id: 18,
            title: 'Occupational therapist',
          },
          {
            id: 17,
            title: 'Nursing associate',
          },
          {
            id: 16,
            title: 'Nursing assistant',
          },
          {
            id: 15,
            title: 'Middle management',
          },
          {
            id: 14,
            title: 'Managers and staff (care-related, but not care-providing)',
          },
          {
            id: 13,
            title: 'First-line manager',
          },
          {
            id: 12,
            title: 'Employment support',
          },
          {
            id: 11,
            title: 'Community, support and outreach work',
          },
          {
            id: 10,
            title: 'Care worker',
          },
          {
            id: 9,
            title: 'Care navigator',
          },
          {
            id: 8,
            title: 'Care coordinator',
          },
          {
            id: 7,
            title: 'Assessment officer',
          },
          {
            id: 6,
            title: "Any children's, young people's job role",
          },
          {
            id: 5,
            title: 'Ancillary staff (non care-providing)',
          },
          {
            id: 4,
            title: 'Allied health professional (not occupational therapist)',
          },
          {
            id: 3,
            title: 'Advice, guidance and advocacy',
          },
          {
            id: 2,
            title: 'Administrative, office staff (non care-providing)',
          },
          {
            id: 1,
            title: 'Activities worker, coordinator',
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      providers: [
        TrainingService,
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                data: {
                  establishment: {
                    uid: '123',
                  },
                },
              },
            },
          },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListMandatoryTrainingComponent);
    component = fixture.componentInstance;
    component.existingMandatoryTrainings = existingMandatoryTrainings;
    fixture.detectChanges();
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
  });

  it('should show header, paragraph and links for manage mandatory training', async () => {
    const mandatoryTrainingHeader = fixture.debugElement.query(By.css('[data-testid="heading"]')).nativeElement;

    const mandatoryTrainingInfo = fixture.debugElement.query(
      By.css('[data-testid="mandatoryTrainingInfo"]'),
    ).nativeElement;

    const addMandatoryTrainingButton = fixture.debugElement.query(
      By.css('[data-testid="mandatoryTrainingButton"]'),
    ).nativeElement;

    expect(mandatoryTrainingHeader.textContent).toContain('Add and manage mandatory training categories');
    expect(mandatoryTrainingInfo.textContent).toContain(
      'Add the training categories you want to make mandatory for your staff. It will help you identify who is missing training and let you know when training expires.',
    );
    expect(addMandatoryTrainingButton.textContent).toContain('Add a mandatory training category');
  });

  it('should show the Remove all mandatory training categories link', async () => {
    existingMandatoryTrainings.mandatoryTrainingCount > 0;
    fixture.detectChanges();

    const removeMandatoryTrainingLink = fixture.debugElement.query(
      By.css('[data-testid="removeMandatoryTrainingLink"]'),
    );
    expect(removeMandatoryTrainingLink).toBeTruthy();
  });
});
