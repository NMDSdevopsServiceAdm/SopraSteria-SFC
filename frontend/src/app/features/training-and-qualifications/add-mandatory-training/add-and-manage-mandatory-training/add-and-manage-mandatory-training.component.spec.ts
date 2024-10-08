import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockTrainingService } from '@core/test-utils/MockTrainingService';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { AddAndManageMandatoryTrainingComponent } from './add-and-manage-mandatory-training.component';

describe('AddAndManageMandatoryTrainingComponent', () => {
  async function setup(isOwnWorkplace = true, duplicateJobRoles = false) {
    const { getByText, getByLabelText, getByTestId, fixture } = await render(AddAndManageMandatoryTrainingComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      providers: [
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        {
          provide: TrainingService,
          useFactory: MockTrainingService.factory(duplicateJobRoles),
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              url: [{ path: 'add-and-manage-mandatory-training' }],
            },
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
    });

    const injector = getTestBed();
    const parentSubsidiaryViewService = injector.inject(ParentSubsidiaryViewService) as ParentSubsidiaryViewService;
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    spyOn(establishmentService, 'isOwnWorkplace').and.returnValue(isOwnWorkplace);

    const component = fixture.componentInstance;

    return {
      getByText,
      getByLabelText,
      getByTestId,
      fixture,
      component,
      parentSubsidiaryViewService,
      establishmentService,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show header, paragraph and links for manage mandatory training', async () => {
    const { getByTestId } = await setup();

    const mandatoryTrainingHeader = getByTestId('heading');

    const mandatoryTrainingInfo = getByTestId('mandatoryTrainingInfo');

    const addMandatoryTrainingButton = getByTestId('mandatoryTrainingButton');
    expect(mandatoryTrainingHeader.textContent).toContain('Add and manage mandatory training categories');
    expect(mandatoryTrainingInfo.textContent).toContain(
      'Add the training categories you want to make mandatory for your staff. It will help you identify who is missing training and let you know when training expires.',
    );
    expect(addMandatoryTrainingButton.textContent).toContain('Add a mandatory training category');
  });

  it('should show the Remove all mandatory training categories link', async () => {
    const { getByTestId } = await setup();

    const removeMandatoryTrainingLink = getByTestId('removeMandatoryTrainingLink');
    expect(removeMandatoryTrainingLink).toBeTruthy();
  });

  it('should show the manage mandatory training table', async () => {
    const { getByTestId } = await setup();

    const mandatoryTrainingTable = getByTestId('training-table');

    expect(mandatoryTrainingTable).toBeTruthy();
  });

  it('should show the manage mandatory training table heading', async () => {
    const { getByTestId } = await setup();

    const mandatoryTrainingTableHeading = getByTestId('training-table-heading');

    expect(mandatoryTrainingTableHeading.textContent).toContain('Mandatory training categories');
    expect(mandatoryTrainingTableHeading.textContent).toContain('Job roles');
  });

  describe('mandatory training table records', () => {
    it('should render a category name for each training record category', async () => {
      const { getByTestId } = await setup();

      const coshCategory = getByTestId('category-Coshh');
      const autismCategory = getByTestId('category-Autism');

      expect(autismCategory.textContent).toContain('Autism');
      expect(coshCategory.textContent).toContain('Coshh');
    });

    it('should render a job name for each training record category', async () => {
      const { getByTestId } = await setup();
      const coshCategory = getByTestId('titleAll');

      const autismCategory = getByTestId('titleJob');
      expect(coshCategory.textContent).toContain('All');
      expect(autismCategory.textContent).toContain('Activities worker, coordinator');
    });

    it('should show all if there are any duplicate job roles and the job roles length is the old all job roles length', async () => {
      const { getByTestId } = await setup(true, true);

      const coshCategory = getByTestId('titleAll');
      const autismCategory = getByTestId('titleJob');

      expect(coshCategory.textContent).toContain('All');
      expect(autismCategory.textContent).toContain('Activities worker, coordinator');
    });

    it('should show all if there are any duplicate job roles and the job roles length is the old all job roles length', async () => {
      const { getByTestId } = await setup(true, true);

      const coshCategory = getByTestId('titleAll');
      const autismCategory = getByTestId('titleJob');

      expect(coshCategory.textContent).toContain('All');
      expect(autismCategory.textContent).toContain('Activities worker, coordinator');
    });
  });

  describe('getBreadcrumbsJourney', () => {
    it('should return mandatory training journey when viewing sub as parent', async () => {
      const { component, parentSubsidiaryViewService } = await setup();
      spyOn(parentSubsidiaryViewService, 'getViewingSubAsParent').and.returnValue(true);
      expect(component.getBreadcrumbsJourney()).toBe(JourneyType.MANDATORY_TRAINING);
    });

    it('should return mandatory training journey when is own workplace', async () => {
      const { component } = await setup();

      expect(component.getBreadcrumbsJourney()).toBe(JourneyType.MANDATORY_TRAINING);
    });

    it('should return all workplaces journey when is not own workplace and not in parent sub view', async () => {
      const { component } = await setup(false);

      expect(component.getBreadcrumbsJourney()).toBe(JourneyType.ALL_WORKPLACES);
    });
  });
});
