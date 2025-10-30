import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockWorkplaceService } from '@core/test-utils/MockWorkplaceService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { BehaviorSubject } from 'rxjs';

import { AddWorkplaceModule } from '../add-workplace.module';
import { RegulatedByCqcComponent } from './regulated-by-cqc.component';

fdescribe('RegulatedByCqcComponent', () => {
  async function setup(addWorkplaceFlow = true) {
    const setupTools = await render(RegulatedByCqcComponent, {
      imports: [SharedModule, AddWorkplaceModule, ReactiveFormsModule],
      providers: [
        {
          provide: WorkplaceService,
          useClass: MockWorkplaceService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              parent: {
                url: [
                  {
                    path: addWorkplaceFlow ? 'add-workplace' : 'confirm-workplace-details',
                  },
                ],
              },
            },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
      spy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the workplace progress bar but not the user progress bar', async () => {
    const { getByTestId, queryByTestId } = await setup();

    expect(getByTestId('progress-bar-1')).toBeTruthy();
    expect(queryByTestId('progress-bar-2')).toBeFalsy();
  });

  it('should not render the progress bar when accessed from outside the flow', async () => {
    const { queryByTestId } = await setup(false);

    expect(queryByTestId('progress-bar-1')).toBeFalsy();
  });

  it('should navigate to the find workplace page when selecting yes', async () => {
    const { getByText, spy, getByRole } = await setup();
    const yesRadioButton = getByRole('radio', { name: 'Yes' });
    fireEvent.click(yesRadioButton);

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(spy).toHaveBeenCalledWith(['/add-workplace', 'find-workplace']);
  });

  it('should navigate to the find-workplace-address page when selecting no', async () => {
    const { getByRole, getByText, spy } = await setup();
    const noRadioButton = getByRole('radio', { name: /^No/ });
    fireEvent.click(noRadioButton);

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(spy).toHaveBeenCalledWith(['/add-workplace', 'find-workplace-address']);
  });

  it('should display an error message when not selecting anything', async () => {
    const { getByText, getByTestId } = await setup();

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    const errorMessage = getByTestId('errorMessage');
    expect(errorMessage.innerText).toContain(
      'Select yes if the main service it provides is regulated by the Care Quality Commission',
    );
  });

  describe('prefillForm()', () => {
    it('should preselect the "Yes" radio button if isCqcRegulated has been set to true in the service', async () => {
      const { component } = await setup();

      component.workplaceService.isCqcRegulated$ = new BehaviorSubject(true);
      component.ngOnInit();

      const form = component.form;
      expect(form.valid).toBeTruthy();
      expect(form.value.regulatedByCQC).toBe('yes');
    });

    it('should preselect the "No" radio button if isCqcRegulated has been set to false in the service', async () => {
      const { component } = await setup();

      component.workplaceService.isCqcRegulated$ = new BehaviorSubject(false);
      component.ngOnInit();

      const form = component.form;
      expect(form.valid).toBeTruthy();
      expect(form.value.regulatedByCQC).toBe('no');
    });

    it('should not preselect any radio buttons if isCqcRegulated has not been set in the service', async () => {
      const { component } = await setup();

      component.workplaceService.isCqcRegulated$ = new BehaviorSubject(null);
      component.ngOnInit();

      const form = component.form;
      expect(form.invalid).toBeTruthy();
      expect(form.value.regulatedByCQC).not.toBe('yes');
      expect(form.value.regulatedByCQC).not.toBe('no');
    });
  });
});
