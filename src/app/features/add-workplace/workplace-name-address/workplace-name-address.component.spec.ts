import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  async function setup() {
    const { fixture, getByText, getAllByText, queryByText } = await render(WorkplaceNameAddressComponent, {
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
                    path: 'add-workplace',
                  },
                ],
              },
            },
          },
        },
        FormBuilder,
      ],
    });

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
    it('should navigate to select-main-service page on success', async () => {
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
      expect(spy).toHaveBeenCalledWith(['/add-workplace', 'select-main-service']);
    });

    it('should navigate to confirm-workplace-details page on success if returnToConfirmDetails is not null', async () => {
      const { component, fixture, getByText, spy } = await setup();
      const form = component.form;

      form.controls['workplaceName'].setValue('Workplace');
      form.controls['address1'].setValue('1 Main Street');
      form.controls['townOrCity'].setValue('London');
      form.controls['county'].setValue('Greater London');
      form.controls['postcode'].setValue('SE1 1AA');

      component.returnToConfirmDetails = { url: ['add-workplace', 'confirm-workplace-details'] };
      fixture.detectChanges();

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeFalsy();
      expect(spy).toHaveBeenCalledWith(['/add-workplace', 'confirm-workplace-details']);
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

  describe('setBackLink', () => {
    it('should set the back link to `confirm-workplace-details` when returnToConfirmDetails is not null', async () => {
      const { component, fixture } = await setup();
      const backLinkSpy = spyOn(component.backService, 'setBackLink');

      component.workplaceService.returnTo$.next({ url: ['add-workplace', 'confirm-details'] });

      component.ngOnInit();

      fixture.whenStable().then(() => {
        component.setBackLink();

        expect(backLinkSpy).toHaveBeenCalledWith({
          url: ['/add-workplace', 'confirm-workplace-details'],
        });
      });
    });

    it('should set the back link to `workplace-not-found` when isCqcRegulated and workplaceNotFound in service are true', async () => {
      const { component, fixture } = await setup();
      const backLinkSpy = spyOn(component.backService, 'setBackLink');

      component.workplaceService.workplaceNotFound$.next(true);
      component.workplaceService.isCqcRegulated$.next(true);

      component.ngOnInit();

      fixture.whenStable().then(() => {
        component.setBackLink();

        expect(backLinkSpy).toHaveBeenCalledWith({
          url: ['/add-workplace', 'workplace-not-found'],
        });
      });
    });

    it('should set the back link to `workplace-address-not-found` when isCqcRegulated is false and workplaceNotFound in service is true', async () => {
      const { component, fixture } = await setup();
      const backLinkSpy = spyOn(component.backService, 'setBackLink');

      component.workplaceService.workplaceNotFound$.next(true);
      component.workplaceService.isCqcRegulated$.next(false);

      component.ngOnInit();

      fixture.whenStable().then(() => {
        component.setBackLink();

        expect(backLinkSpy).toHaveBeenCalledWith({
          url: ['/add-workplace', 'workplace-address-not-found'],
        });
      });
    });

    it('should set the back link to `select-workplace` when isCqcRegulated is true and workplaceNotFound in service is false', async () => {
      const { component, fixture } = await setup();
      const backLinkSpy = spyOn(component.backService, 'setBackLink');

      component.workplaceService.workplaceNotFound$.next(false);
      component.workplaceService.isCqcRegulated$.next(true);

      component.ngOnInit();

      fixture.whenStable().then(() => {
        component.setBackLink();

        expect(backLinkSpy).toHaveBeenCalledWith({
          url: ['/add-workplace', 'select-workplace'],
        });
      });
    });

    it('should set the back link to `select-workplace-address` when isCqcRegulated is false and workplaceNotFound in service is false', async () => {
      const { component, fixture } = await setup();
      const backLinkSpy = spyOn(component.backService, 'setBackLink');

      component.workplaceService.workplaceNotFound$.next(false);
      component.workplaceService.isCqcRegulated$.next(false);

      component.ngOnInit();

      fixture.whenStable().then(() => {
        component.setBackLink();

        expect(backLinkSpy).toHaveBeenCalledWith({
          url: ['/add-workplace', 'select-workplace-address'],
        });
      });
    });
  });
});
