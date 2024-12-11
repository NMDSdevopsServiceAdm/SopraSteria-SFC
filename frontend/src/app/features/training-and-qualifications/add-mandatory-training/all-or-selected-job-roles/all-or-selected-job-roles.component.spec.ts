import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TrainingService } from '@core/services/training.service';
import { MockRouter } from '@core/test-utils/MockRouter';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { Observable } from 'rxjs';

import { AddMandatoryTrainingModule } from '../add-mandatory-training.module';
import { AllOrSelectedJobRolesComponent } from './all-or-selected-job-roles.component';

describe('AllOrSelectedJobRolesComponent', () => {
  async function setup(overrides: any = {}) {
    const routerSpy = jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true));

    const setupTools = await render(AllOrSelectedJobRolesComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, AddMandatoryTrainingModule],
      providers: [
        {
          provide: TrainingService,
          useValue: {
            selectedTraining:
              overrides.selectedTraining !== undefined
                ? overrides.selectedTraining
                : {
                    trainingCategory: {
                      category: 'Activity provision, wellbeing',
                      id: 1,
                      seq: 0,
                      trainingCategoryGroup: 'Care skills and knowledge',
                    },
                  },
            clearSelectedTrainingCategory: () => {},
          },
        },
        { provide: Router, useFactory: MockRouter.factory({ navigate: routerSpy }) },
        {
          provide: ActivatedRoute,
          useValue: {
            params: Observable.from([{ establishmentuid: 'establishmentUid', id: 1 }]),
            snapshot: {
              data: { establishment: { uid: 'testuid' } },
            },
          },
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;
    const injector = getTestBed();
    const trainingService = injector.inject(TrainingService) as TrainingService;
    const clearSelectedTrainingCategorySpy = spyOn(trainingService, 'clearSelectedTrainingCategory').and.callThrough();

    return {
      ...setupTools,
      component,
      routerSpy,
      clearSelectedTrainingCategorySpy,
    };
  }

  it('should render component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the page caption', async () => {
    const { getByText } = await setup();

    const caption = getByText('Add a mandatory training category');

    expect(caption).toBeTruthy();
  });

  ['Activity provision, wellbeing', 'Digital leadership skills'].forEach((category) => {
    it('should display mandatory for everybody message with selected training category when All job roles radio is clicked', async () => {
      const selectedTraining = {
        trainingCategory: {
          category,
          id: 1,
          seq: 0,
          trainingCategoryGroup: 'Care skills and knowledge',
        },
      };

      const { component, getByText, routerSpy } = await setup({ selectedTraining });

      const expectedMessage = `If you click Continue, '${selectedTraining.trainingCategory.category}' will be mandatory for everybody in your workplace.`;
      const allJobRolesRadio = getByText('All job roles');
      userEvent.click(allJobRolesRadio);

      expect(getByText(expectedMessage)).toBeTruthy();
    });
  });

  it('should show the page heading', async () => {
    const { getByText } = await setup();

    const heading = getByText('Which job roles need this training?');

    expect(heading).toBeTruthy();
  });

  it('should navigate back to the select training category page if no training category set in training service', async () => {
    const { component, routerSpy } = await setup({ selectedTraining: null });

    expect(routerSpy).toHaveBeenCalledWith(['../select-training-category'], { relativeTo: component.route });
  });

  it('should navigate to the add-and-manage-mandatory-training page (relative route ../)  if Cancel button is clicked', async () => {
    const { component, getByText, routerSpy } = await setup({ selectedTraining: null });

    const cancelButton = getByText('Cancel');
    userEvent.click(cancelButton);

    expect(routerSpy).toHaveBeenCalledWith(['../'], { relativeTo: component.route });
  });

  describe('Error messages', () => {
    it('should display an error message if option not selected and Continue is clicked', async () => {
      const { fixture, getByText, getAllByText } = await setup();

      fireEvent.click(getByText('Continue'));
      fixture.detectChanges();

      expect(
        getAllByText('Select whether this training is for all job roles or only selected job roles').length,
      ).toEqual(2);
    });
  });
});
