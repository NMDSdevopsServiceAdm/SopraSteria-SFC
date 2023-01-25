import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { MockArticlesService } from '@core/test-utils/MockArticlesService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPagesService } from '@core/test-utils/MockPagesService';
import { MockTrainingService } from '@core/test-utils/MockTrainingService';
import { AddMandatoryTrainingModule } from '@features/add-mandatory-training/add-mandatory-training.module';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, getByText, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { DeleteMandatoryTrainingCategoryComponent } from './delete-mandatory-training-category.component';

describe('DeleteMandatoryTrainingCategoryComponent', () => {
  const pages = MockPagesService.pagesFactory();
  const articleList = MockArticlesService.articleListFactory();

  async function setup(trainingCategoryId = '1') {
    const { fixture, getByText, getAllByText } = await render(DeleteMandatoryTrainingCategoryComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, AddMandatoryTrainingModule, HttpClientTestingModule],
      declarations: [],
      providers: [
        AlertService,
        BackService,
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: TrainingService,
          useClass: MockTrainingService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              parent: {
                url: [{ path: trainingCategoryId }],
                data: {
                  establishment: {
                    uid: '9',
                  },
                },
              },
              url: [{ path: 'delete-mandatory-training-category' }],
            },
          },
        },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const alertService = injector.inject(AlertService) as AlertService;
    const trainingService = injector.inject(TrainingService) as TrainingService;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const deleteMandatoryTrainingCategorySpy = spyOn(trainingService, 'deleteCategoryById').and.callThrough();
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();
    const component = fixture.componentInstance;
    return {
      component,
      fixture,
      getByText,
      getAllByText,
      routerSpy,
      deleteMandatoryTrainingCategorySpy,
      alertSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the heading', async () => {
    const { getByText } = await setup();
    expect(getByText(`You're about to remove this mandatory training category`));
  });

  it('should display the correct training name when navigating to the page with a category ID', async () => {
    const { getAllByText } = await setup();
    expect(getAllByText('Activity provision/Well-being', { exact: false }).length).toEqual(2);
  });

  it('Should render Remove categories button and cancel link', async () => {
    const { getByText } = await setup();
    expect(getByText('Remove category')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  describe('Cancel link', () => {
    it('should navigate back to the mandatory details summary page when clicked', async () => {
      const { component, getByText, routerSpy } = await setup();
      userEvent.click(getByText('Cancel'));
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.establishment.uid,
        'add-and-manage-mandatory-training',
      ]);
    });
  });

  describe('Remove category button', () => {
    it('should call the deleteCategoryById function in the training service when clicked', async () => {
      const { getByText, deleteMandatoryTrainingCategorySpy } = await setup();
      userEvent.click(getByText('Remove category'));
      expect(deleteMandatoryTrainingCategorySpy).toHaveBeenCalled();
    });
  });

  describe('success alert', async () => {
    it('should display a success banner when a category is removed', async () => {
      const { alertSpy, getByText } = await setup();

      fireEvent.click(getByText('Remove category'));
      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Mandatory training category removed',
      });
    });
  });
});
