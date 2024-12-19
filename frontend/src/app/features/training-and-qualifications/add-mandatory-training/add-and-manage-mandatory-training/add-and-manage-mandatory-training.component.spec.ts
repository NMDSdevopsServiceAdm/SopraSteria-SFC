import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { mockMandatoryTraining, MockTrainingService } from '@core/test-utils/MockTrainingService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { AddAndManageMandatoryTrainingComponent } from './add-and-manage-mandatory-training.component';

describe('AddAndManageMandatoryTrainingComponent', () => {
  const noMandatoryTraining = {
    allJobRolesCount: 37,
    lastUpdated: new Date(),
    mandatoryTraining: [],
    mandatoryTrainingCount: 0,
  };

  async function setup(overrides: any = {}) {
    const establishment = establishmentBuilder() as Establishment;
    const existingMandatoryTraining = mockMandatoryTraining();

    const setupTools = await render(AddAndManageMandatoryTrainingComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule.withRoutes([]), HttpClientTestingModule],
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
          useFactory: MockTrainingService.factory(overrides.duplicateJobRoles ?? false),
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
              data: {
                establishment,
                existingMandatoryTraining: overrides.mandatoryTraining ?? existingMandatoryTraining,
              },
            },
          },
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const currentRoute = injector.inject(ActivatedRoute) as ActivatedRoute;

    return {
      ...setupTools,
      component,
      establishment,
      existingMandatoryTraining,
      routerSpy,
      currentRoute,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show header and paragraph', async () => {
    const { getByTestId } = await setup();

    const mandatoryTrainingHeader = getByTestId('heading');
    const mandatoryTrainingInfo = getByTestId('mandatoryTrainingInfo');

    expect(mandatoryTrainingHeader.textContent).toContain('Add and manage mandatory training categories');
    expect(mandatoryTrainingInfo.textContent).toContain(
      'Add the training categories you want to make mandatory for your staff. It will help you to identify who is missing training and let you know when training expires.',
    );
  });

  it("should navigate to the select-training-category page when 'Add a mandatory training category' link is clicked", async () => {
    const { getByRole, routerSpy, currentRoute } = await setup();

    const addMandatoryTrainingButton = getByRole('button', { name: 'Add a mandatory training category' });
    fireEvent.click(addMandatoryTrainingButton);

    expect(routerSpy).toHaveBeenCalledWith(['select-training-category'], { relativeTo: currentRoute });
  });

  describe('Remove all link', () => {
    it('should show with link to the remove all page when there is mandatory training', async () => {
      const { getByText, establishment } = await setup();

      const removeMandatoryTrainingLink = getByText('Remove all') as HTMLAnchorElement;

      expect(removeMandatoryTrainingLink.href).toContain(
        `/workplace/${establishment.uid}/add-and-manage-mandatory-training/remove-all-mandatory-training`,
      );
    });

    it('should not show if no mandatory training set up', async () => {
      const { queryByText } = await setup({ mandatoryTraining: noMandatoryTraining });

      expect(queryByText('Remove all')).toBeFalsy();
    });

    it('should not show if mandatory training only set up for one training category', async () => {
      const existingMandatoryTraining = mockMandatoryTraining();

      existingMandatoryTraining.mandatoryTraining = [existingMandatoryTraining.mandatoryTraining[0]];
      existingMandatoryTraining.mandatoryTrainingCount = 1;

      const { queryByText } = await setup({ mandatoryTraining: existingMandatoryTraining });

      expect(queryByText('Remove all')).toBeFalsy();
    });
  });

  describe('Mandatory training table', () => {
    it('should show the manage mandatory training table', async () => {
      const { getByTestId } = await setup();

      const mandatoryTrainingTable = getByTestId('training-table');

      expect(mandatoryTrainingTable).toBeTruthy();
    });

    it('should show the manage mandatory training table headings', async () => {
      const { getByTestId } = await setup();

      const mandatoryTrainingTableHeading = getByTestId('training-table-heading');

      expect(mandatoryTrainingTableHeading.textContent).toContain('Mandatory training category');
      expect(mandatoryTrainingTableHeading.textContent).toContain('Job role');
    });

    it('should not show if no mandatory training set up', async () => {
      const { queryByTestId } = await setup({ mandatoryTraining: noMandatoryTraining });

      const mandatoryTrainingTableHeadings = queryByTestId('training-table-heading');

      expect(mandatoryTrainingTableHeadings).toBeFalsy();
    });
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

    it(`should have a Remove link for each training category which takes user to its remove page`, async () => {
      const { getByTestId, existingMandatoryTraining, routerSpy, currentRoute } = await setup();

      existingMandatoryTraining.mandatoryTraining.forEach((trainingCategory) => {
        const removeLink = getByTestId('remove-link-' + trainingCategory.category) as HTMLAnchorElement;
        fireEvent.click(removeLink);

        expect(routerSpy).toHaveBeenCalledWith(
          [trainingCategory.trainingCategoryId, 'delete-mandatory-training-category'],
          { relativeTo: currentRoute },
        );
      });
    });

    describe('Handling duplicate job roles', () => {
      it('should show all if there are any duplicate job roles and the job roles length is the old all job roles length', async () => {
        const { getByTestId } = await setup({ duplicateJobRoles: true });

        const coshCategory = getByTestId('titleAll');
        const autismCategory = getByTestId('titleJob');

        expect(coshCategory.textContent).toContain('All');
        expect(autismCategory.textContent).toContain('Activities worker, coordinator');
      });

      it('should show all if there are any duplicate job roles and the job roles length is the old all job roles length', async () => {
        const { getByTestId } = await setup({ duplicateJobRoles: true });

        const coshCategory = getByTestId('titleAll');
        const autismCategory = getByTestId('titleJob');

        expect(coshCategory.textContent).toContain('All');
        expect(autismCategory.textContent).toContain('Activities worker, coordinator');
      });
    });
  });
});
