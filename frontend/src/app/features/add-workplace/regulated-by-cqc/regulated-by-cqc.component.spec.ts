import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockWorkplaceService } from '@core/test-utils/MockWorkplaceService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { BehaviorSubject } from 'rxjs';

import { AddWorkplaceModule } from '../add-workplace.module';
import { RegulatedByCqcComponent } from './regulated-by-cqc.component';

describe('RegulatedByCqcComponent', () => {
  async function setup(addWorkplaceFlow = true) {
    const component = await render(RegulatedByCqcComponent, {
      imports: [SharedModule, AddWorkplaceModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
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
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      spy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the workplace progress bar but not the user progress bar', async () => {
    const { component } = await setup();

    expect(component.getByTestId('progress-bar-1')).toBeTruthy();
    expect(component.queryByTestId('progress-bar-2')).toBeFalsy();
  });

  it('should not render the progress bar when accessed from outside the flow', async () => {
    const { component } = await setup(false);

    expect(component.queryByTestId('progress-bar-1')).toBeFalsy();
  });

  it('should navigate to the find workplace page when selecting yes', async () => {
    const { component, spy } = await setup();
    const yesRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="yes"]`);
    fireEvent.click(yesRadioButton);

    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);

    expect(spy).toHaveBeenCalledWith(['/add-workplace', 'find-workplace']);
  });

  it('should navigate to the find-workplace-address page when selecting no', async () => {
    const { component, spy } = await setup();
    const noRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="no"]`);
    fireEvent.click(noRadioButton);

    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);

    expect(spy).toHaveBeenCalledWith(['/add-workplace', 'find-workplace-address']);
  });

  it('should display an error message when not selecting anything', async () => {
    const { component } = await setup();

    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);

    const errorMessage = component.getByTestId('errorMessage');
    expect(errorMessage.innerText).toContain(
      'Select yes if the main service it provides is regulated by the Care Quality Commission',
    );
  });

  describe('prefillForm()', () => {
    it('should preselect the "Yes" radio button if isCqcRegulated has been set to true in the service', async () => {
      const { component } = await setup();

      component.fixture.componentInstance.workplaceService.isCqcRegulated$ = new BehaviorSubject(true);
      component.fixture.componentInstance.ngOnInit();

      const form = component.fixture.componentInstance.form;
      expect(form.valid).toBeTruthy();
      expect(form.value.regulatedByCQC).toBe('yes');
    });

    it('should preselect the "No" radio button if isCqcRegulated has been set to false in the service', async () => {
      const { component } = await setup();

      component.fixture.componentInstance.workplaceService.isCqcRegulated$ = new BehaviorSubject(false);
      component.fixture.componentInstance.ngOnInit();

      const form = component.fixture.componentInstance.form;
      expect(form.valid).toBeTruthy();
      expect(form.value.regulatedByCQC).toBe('no');
    });

    it('should not preselect any radio buttons if isCqcRegulated has not been set in the service', async () => {
      const { component } = await setup();

      component.fixture.componentInstance.workplaceService.isCqcRegulated$ = new BehaviorSubject(null);
      component.fixture.componentInstance.ngOnInit();

      const form = component.fixture.componentInstance.form;
      expect(form.invalid).toBeTruthy();
      expect(form.value.regulatedByCQC).not.toBe('yes');
      expect(form.value.regulatedByCQC).not.toBe('no');
    });
  });
});
