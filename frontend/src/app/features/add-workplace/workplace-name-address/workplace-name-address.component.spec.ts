import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockWorkplaceService } from '@core/test-utils/MockWorkplaceService';
import { WorkplaceNameAddressComponent } from '@features/add-workplace/workplace-name-address/workplace-name-address.component';
import { WorkplaceModule } from '@features/workplace/workplace.module';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { BehaviorSubject } from 'rxjs';

describe('WorkplaceNameAddressComponent', () => {
  async function setup(addWorkplaceFlow = true) {
    const { fixture, getByText, getAllByText, queryByText, queryByTestId, getByTestId } = await render(
      WorkplaceNameAddressComponent,
      {
        imports: [
          SharedModule,
          WorkplaceModule,
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
          UntypedFormBuilder,
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
      queryByTestId,
      getByTestId,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the correct title', async () => {
    const { fixture, getByText } = await setup();
    const expectedTitle = `What's the workplace name and address?`;

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(getByText(expectedTitle, { exact: false })).toBeTruthy();
    });
  });

  describe('preFillForm()', () => {
    it('should prefill the workplace name and address if manuallyEnteredWorkplace is true', async () => {
      const { component, fixture, getByText } = await setup();

      const spy = spyOn(component, 'preFillForm').and.callThrough();

      component.workplaceService.manuallyEnteredWorkplace$ = new BehaviorSubject(true);
      component.ngOnInit();
      component.setupPreFillForm();

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      fixture.whenStable().then(() => {
        expect(spy).toHaveBeenCalled();
        expect(component.form.value).toEqual({
          workplaceName: 'Workplace Name',
          address1: '1 Street',
          address2: 'Second Line',
          address3: 'Third Line',
          townOrCity: 'Manchester',
          county: 'Greater Manchester',
          postcode: 'ABC 123',
        });
      });
    });

    it('should prefill the workplace name and address if returnToConfirmDetails is true', async () => {
      const { component, fixture, getByText } = await setup();

      const spy = spyOn(component, 'preFillForm').and.callThrough();

      component.workplaceService.returnTo$ = new BehaviorSubject({ url: ['add-workplace', 'confirm-details'] });
      component.ngOnInit();
      component.setupPreFillForm();

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      fixture.whenStable().then(() => {
        expect(spy).toHaveBeenCalled();
        expect(component.form.value).toEqual({
          workplaceName: 'Workplace Name',
          address1: '1 Street',
          address2: 'Second Line',
          address3: 'Third Line',
          townOrCity: 'Manchester',
          county: 'Greater Manchester',
          postcode: 'ABC 123',
        });
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to type-of-employer page on success', async () => {
      const { component, fixture, getByText, spy } = await setup();
      const form = component.form;

      form.controls['workplaceName'].setValue('Workplace');
      form.controls['address1'].setValue('1 Main Street');
      form.controls['townOrCity'].setValue('London');
      form.controls['county'].setValue('Greater London');
      form.controls['postcode'].setValue('SE1 1AA');

      fixture.detectChanges();

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeFalsy();
      expect(spy).toHaveBeenCalledWith(['add-workplace', 'type-of-employer']);
    });

    it('should show the Save and return button and an exit link when inside the flow', async () => {
      const { component, fixture, getByText } = await setup();

      component.insideFlow = false;
      fixture.detectChanges();

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('should navigate to confirm-workplace-details page on success if returnToConfirmDetails is not null', async () => {
      const { component, fixture, getByText, spy } = await setup(false);
      const form = component.form;

      form.controls['workplaceName'].setValue('Workplace');
      form.controls['address1'].setValue('1 Main Street');
      form.controls['townOrCity'].setValue('London');
      form.controls['county'].setValue('Greater London');
      form.controls['postcode'].setValue('SE1 1AA');

      component.returnToConfirmDetails = { url: ['add-workplace', 'confirm-workplace-details'] };
      fixture.detectChanges();

      const continueButton = getByText('Save and return');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeFalsy();
      expect(spy).toHaveBeenCalledWith(['add-workplace/confirm-workplace-details']);
    });
  });

  describe('Error messages', () => {
    it(`should display an error message when workplace name isn't filled in`, async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'Enter the name of the workplace';

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });
  });

  describe('progressBar', () => {
    it('should render the workplace progress bar but not the user progress bar', async () => {
      const { getByTestId, queryByTestId } = await setup();

      expect(getByTestId('progress-bar-1')).toBeTruthy();
      expect(queryByTestId('progress-bar-2')).toBeFalsy();
    });

    it('should not render the progress bar when accessed from outside the flow', async () => {
      const { queryByTestId } = await setup(false);

      expect(queryByTestId('progress-bar-1')).toBeFalsy();
    });
  });
});
