import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { TrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { MockRouter } from '@core/test-utils/MockRouter';
import { MockTrainingCategoryService } from '@core/test-utils/MockTrainingCategoriesService';
import { mockMandatoryTraining, MockTrainingService } from '@core/test-utils/MockTrainingService';
import {
  AddMandatoryTrainingModule,
} from '@features/training-and-qualifications/add-mandatory-training/add-mandatory-training.module';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { DeleteMandatoryTrainingCategoryComponent } from './delete-mandatory-training-category.component';

describe('DeleteMandatoryTrainingCategoryComponent', () => {
  async function setup(overrides: any = {}) {
    const establishment = establishmentBuilder();
    const routerSpy = jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true));

    const existingMandatoryTraining = mockMandatoryTraining();
    const selectedTraining = existingMandatoryTraining.mandatoryTraining[0];
    const trainingIdInParams = selectedTraining.trainingCategoryId;

    const setupTools = await render(DeleteMandatoryTrainingCategoryComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, AddMandatoryTrainingModule, HttpClientTestingModule],
      declarations: [],
      providers: [
        AlertService,
        BackService,
        WindowRef,
        {
          provide: TrainingService,
          useClass: MockTrainingService,
        },
        { provide: Router, useFactory: MockRouter.factory({ navigate: routerSpy }) },
        {
          provide: TrainingCategoryService,
          useClass: MockTrainingCategoryService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                trainingCategoryId: overrides.trainingCategoryId ?? trainingIdInParams,
              },
              data: {
                establishment,
                existingMandatoryTraining: overrides.mandatoryTraining ?? existingMandatoryTraining,
              },
              url: [{ path: 'delete-mandatory-training-category' }],
            },
          },
        },
      ],
    });

    const injector = getTestBed();

    const alertService = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();

    const trainingService = injector.inject(TrainingService) as TrainingService;
    const deleteMandatoryTrainingCategorySpy = spyOn(trainingService, 'deleteCategoryById').and.callThrough();

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
      routerSpy,
      deleteMandatoryTrainingCategorySpy,
      alertSpy,
      establishment,
      selectedTraining,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the heading', async () => {
    const { getByText } = await setup();
    expect(getByText("You're about to remove this mandatory training category")).toBeTruthy();
  });

  it('should display the correct training name when navigating to the page with a category ID', async () => {
    const { getAllByText, selectedTraining } = await setup();

    expect(getAllByText(selectedTraining.category, { exact: false }).length).toEqual(2);
  });

  it('should render Remove categories button and cancel link', async () => {
    const { getByText } = await setup();

    expect(getByText('Remove category')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('should navigate back to add-and-manage-mandatory-training page if training category not found in existing mandatory training', async () => {
    const unexpectedTrainingCategoryId = '301';

    const { getByText, routerSpy, establishment } = await setup({ trainingCategoryId: unexpectedTrainingCategoryId });

    expect(routerSpy).toHaveBeenCalledWith(['/workplace', establishment.uid, 'add-and-manage-mandatory-training']);
  });

  describe('On submit', () => {
    it('should call deleteCategoryById in the training service', async () => {
      const { getByText, deleteMandatoryTrainingCategorySpy } = await setup();

      userEvent.click(getByText('Remove category'));
      expect(deleteMandatoryTrainingCategorySpy).toHaveBeenCalled();
    });

    it("should display a success banner with 'Mandatory training category removed'", async () => {
      const { alertSpy, getByText } = await setup();

      fireEvent.click(getByText('Remove category'));
      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Mandatory training category removed',
      });
    });

    it('should navigate back to add-and-manage-mandatory-training page', async () => {
      const { getByText, routerSpy, establishment } = await setup();

      userEvent.click(getByText('Remove category'));

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', establishment.uid, 'add-and-manage-mandatory-training']);
    });
  });

  describe('Cancel link', () => {
    it('should navigate back to the mandatory details summary page when clicked', async () => {
      const { getByText, routerSpy, establishment } = await setup();

      userEvent.click(getByText('Cancel'));

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', establishment.uid, 'add-and-manage-mandatory-training']);
    });
  });
});
