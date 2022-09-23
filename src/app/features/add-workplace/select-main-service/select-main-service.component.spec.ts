import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockWorkplaceService } from '@core/test-utils/MockWorkplaceService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { AddWorkplaceModule } from '../add-workplace.module';
import { SelectMainServiceComponent } from './select-main-service.component';

describe('SelectMainServiceComponent', () => {
  async function setup(addWorkplaceFlow = true) {
    const { fixture, getByText, getAllByText, queryByText, getByLabelText, getByTestId, queryByTestId } = await render(
      SelectMainServiceComponent,
      {
        imports: [
          SharedModule,
          AddWorkplaceModule,
          RouterTestingModule,
          HttpClientTestingModule,
          FormsModule,
          ReactiveFormsModule,
        ],
        providers: [
          {
            provide: WorkplaceService,
            useClass: MockWorkplaceService,
          },
          {
            provide: EstablishmentService,
            useClass: MockEstablishmentService,
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
          FormBuilder,
        ],
      },
    );

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      spy,
      getAllByText,
      queryByText,
      getByText,
      getByLabelText,
      getByTestId,
      queryByTestId,
    };
  }

  it('should show SelectMainServiceComponent component', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should render the subheading of Workplace', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('subheading').innerText).toEqual('Workplace');
  });

  it('should render the workplace progress bar but not the user progress bar', async () => {
    const { getByTestId, queryByTestId } = await setup();

    expect(getByTestId('progress-bar-1')).toBeTruthy();
    expect(queryByTestId('progress-bar-2')).toBeFalsy();
  });

  it('should not render the progress bar when accessed from outside the flow', async () => {
    const { queryByTestId } = await setup(false);

    expect(queryByTestId('progress-bar-1')).toBeFalsy();
    expect(queryByTestId('progress-bar-2')).toBeFalsy();
  });

  it('should show CQC text when following the CQC regulated flow', async () => {
    const { component, fixture, getByText } = await setup();

    component.isRegulated = true;

    fixture.detectChanges();
    const cqcText = getByText(
      'Because you said the main service you provide is regulated by the Care Quality Commission (CQC), Skills for Care will need to check your selection matches the CQC database.',
    );
    expect(cqcText).toBeTruthy();
  });

  it('should show no description text when following the not CQC regulated flow', async () => {
    const { component, fixture, queryByText } = await setup();

    component.isRegulated = false;

    fixture.detectChanges();
    const cqcText = queryByText(
      'We need some details about where you work. You need to answer these questions before we can create your account.',
    );

    expect(cqcText).toBeNull();
  });

  it('should see "Select its main service"', async () => {
    const { component, fixture, queryByText } = await setup();

    component.isParent = true;
    component.isRegulated = false;
    fixture.detectChanges();

    expect(queryByText('Select their main service')).toBeTruthy();
  });

  it('should show add-workplace error message when nothing has been selected', async () => {
    const { component, fixture, getByText, getAllByText } = await setup();
    component.isRegulated = true;
    const form = component.form;

    fixture.detectChanges();

    const errorMessage = 'Select the main service it provides';

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(form.invalid).toBeTruthy();
    expect(getAllByText(errorMessage).length).toBe(2);
  });

  it('should submit and go to the add-workplace/add-total-staff url when option selected', async () => {
    const { component, fixture, getByText, getByLabelText, spy } = await setup();

    component.isParent = true;
    component.isRegulated = true;
    fixture.detectChanges();

    const radioButton = getByLabelText('Name');
    fireEvent.click(radioButton);

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(spy).toHaveBeenCalledWith(['add-workplace', 'add-total-staff']);
  });

  describe('setBackLink()', () => {
    it('should set back link to type-of-employer', async () => {
      const { component, fixture } = await setup();

      const backLinkSpy = spyOn(component.backService, 'setBackLink');

      component.setBackLink();
      fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['add-workplace', 'type-of-employer'],
      });
    });
  });
});
