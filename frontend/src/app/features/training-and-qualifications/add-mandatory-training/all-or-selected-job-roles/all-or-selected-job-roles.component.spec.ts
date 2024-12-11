import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TrainingService } from '@core/services/training.service';
import { MockTrainingService } from '@core/test-utils/MockTrainingService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { Observable } from 'rxjs';

import { AddMandatoryTrainingModule } from '../add-mandatory-training.module';
import { AllOrSelectedJobRolesComponent } from './all-or-selected-job-roles.component';

describe('AllOrSelectedJobRolesComponent', () => {
  async function setup() {
    const setupTools = await render(AllOrSelectedJobRolesComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, AddMandatoryTrainingModule],
      providers: [
        { provide: TrainingService, useClass: MockTrainingService },
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
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
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

  it('should show the page heading', async () => {
    const { getByText } = await setup();

    const heading = getByText('Which job roles need this training?');

    expect(heading).toBeTruthy();
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
