import { fireEvent, render } from '@testing-library/angular';
import { SelectTrainingCategoryMultipleComponent } from './select-training-category-multiple.component';
import { getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TrainingService } from '@core/services/training.service';
import { MockTrainingService } from '@core/test-utils/MockTrainingService';
import { Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';

fdescribe('SelectTrainingCategoryMultipleComponent', () => {
  async function setup() {
    const { fixture, getByText } = await render(SelectTrainingCategoryMultipleComponent, {
      imports: [HttpClientTestingModule],
      providers: [
        BackLinkService,
        {
          provide: TrainingService,
          useClass: MockTrainingService,
        },
      ],
    });
    const component = fixture.componentInstance;
    const injector = getTestBed();

    const router = injector.inject(Router) as Router;
    const trainingService = injector.inject(TrainingService) as TrainingService;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const trainingServiceSpy = spyOn(trainingService, 'resetSelectedStaff').and.callThrough();

    return {
      component,
      fixture,
      getByText,
      routerSpy,
      trainingServiceSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the page caption', async () => {
    const { getByText } = await setup();

    const caption = getByText('Add multiple records');

    expect(caption).toBeTruthy();
  });

  it('should show the page heading', async () => {
    const { getByText } = await setup();

    const heading = getByText('Select the category that best matches the training taken');

    expect(heading).toBeTruthy();
  });

  it('should show the continue button', async () => {
    const { component, getByText } = await setup();

    const button = getByText('Continue');

    expect(button).toBeTruthy();
  });

  it('should show the cancel link', async () => {
    const { component, getByText } = await setup();

    const cancelLink = getByText('Cancel');

    expect(cancelLink).toBeTruthy();
  });

  it('should reset selected staff in training service and navigate to dashboard after clicking Cancel', async () => {
    const { getByText, fixture, routerSpy, trainingServiceSpy } = await setup();

    const cancelLink = getByText('Cancel');
    fireEvent.click(cancelLink);
    fixture.detectChanges();

    expect(trainingServiceSpy).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'training-and-qualifications' });
  });
});
