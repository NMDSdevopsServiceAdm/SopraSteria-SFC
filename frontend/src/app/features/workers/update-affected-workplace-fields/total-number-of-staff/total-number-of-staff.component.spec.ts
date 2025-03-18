import lodash from 'lodash';
import { of } from 'rxjs';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { TotalNumberOfStaffComponent } from './total-number-of-staff.component';

describe('TotalNumberOfStaffComponent', () => {
  const mockEstablishment = establishmentBuilder() as Establishment;

  const setup = async (overrides: any = {}) => {
    const numberOfStaff = overrides?.numberOfStaff ?? 10;
    const returnTo = { url: ['workplace', mockEstablishment.uid, 'update-workplace-details'] };

    const setupTools = await render(TotalNumberOfStaffComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: EstablishmentService,
          useValue: {
            primaryWorkplace: { isParent: true, parentName: null },
            standAloneAccount: false,
            getStaff() {
              return of(numberOfStaff);
            },
            postStaff() {},
            returnTo,
          },
        },
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            parent: {
              snapshot: {
                data: {
                  establishment: mockEstablishment,
                },
              },
            },
          }),
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;
    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const router = injector.inject(Router) as Router;
    const postStaffSpy = spyOn(establishmentService, 'postStaff').and.returnValue(of(null));
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      ...setupTools,
      component,
      postStaffSpy,
      routerSpy,
      mockEstablishment,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should show a page heading', async () => {
      const { getByRole } = await setup();

      const expectedHeading = 'Update the total number of staff for your workplace';
      expect(getByRole('heading', { level: 1, name: expectedHeading })).toBeTruthy();
    });

    it('should show a reveal text to explain Why we ask for this information', async () => {
      const { getByText } = await setup();
      const revealText = getByText('Why we ask for this information');

      expect(revealText).toBeTruthy();
      userEvent.click(revealText);

      const revealTextContent =
        'We need to know the total number of staff employed in workplaces so that we can calculate how many people work in the sector. ' +
        'We also use it to work out turnover and vacancy rates, staff to service ratios and to see if the sector is growing.';
      expect(getByText(revealTextContent)).toBeTruthy();
    });

    it('should show a Save and return button and a Cancel link', async () => {
      const { getByRole, getByText } = await setup();

      expect(getByRole('button', { name: 'Save and return' })).toBeTruthy();

      const cancelLink = getByText('Cancel');
      expect(cancelLink).toBeTruthy();
    });

    it('should show an input box with buttons for number of staff', async () => {
      const { getByText, getByTestId, getByRole } = await setup();

      expect(getByText('Number of staff')).toBeTruthy();
      expect(getByRole('textbox', { name: 'Number of staff' })).toBeTruthy();
      expect(getByTestId('plus-button-total-number-of-staff')).toBeTruthy();
      expect(getByTestId('minus-button-total-number-of-staff')).toBeTruthy();
    });

    it('should handle value change by plus or minus button correctly', async () => {
      const { getByLabelText, getByTestId } = await setup({ numberOfStaff: 10 });

      const plusButton = getByTestId('plus-button-total-number-of-staff');
      const minusButton = getByTestId('minus-button-total-number-of-staff');
      const numberInput = getByLabelText('Number of staff') as HTMLInputElement;

      lodash.times(5, () => userEvent.click(plusButton));

      expect(numberInput.value).toEqual('15');

      lodash.times(10, () => userEvent.click(minusButton));

      expect(numberInput.value).toEqual('5');
    });
  });

  describe('prefill', () => {
    it('should prefill the number of staff of the establishment', async () => {
      const { getByLabelText } = await setup({ numberOfStaff: 42 });

      const numberInput = getByLabelText('Number of staff') as HTMLInputElement;
      expect(numberInput.value).toEqual('42');
    });
  });

  describe('on submit', () => {
    it('should call establishment service postStaff() with the updated number of staff', async () => {
      const { fixture, postStaffSpy, mockEstablishment } = await setup({ numberOfStaff: 20 });

      await fillInNumberAndSubmitForm('10');
      fixture.detectChanges();

      expect(postStaffSpy).toHaveBeenCalledWith(mockEstablishment.uid, 10);
    });

    it('should show an error when user input is empty', async () => {
      const { fixture, postStaffSpy, getByRole } = await setup();

      await fillInNumberAndSubmitForm('');
      userEvent.click(getByRole('button', { name: 'Save and return' }));

      fixture.detectChanges();

      expectErrorMessageAppears('Enter how many members of staff the workplace has');
      expect(postStaffSpy).not.toHaveBeenCalled();
    });

    it('should show an error when user input is not a valid number', async () => {
      const { fixture, postStaffSpy } = await setup();

      await fillInNumberAndSubmitForm('banana');
      fixture.detectChanges();

      expectErrorMessageAppears('Enter the number of staff as a digit, like 7');
      expect(postStaffSpy).not.toHaveBeenCalled();
    });

    it('should show an error when user input is out of allowed range', async () => {
      const { fixture, postStaffSpy } = await setup();

      await fillInNumberAndSubmitForm('0');
      fixture.detectChanges();

      expectErrorMessageAppears('Number of staff must be a whole number between 1 and 999');
      expect(postStaffSpy).not.toHaveBeenCalled();
    });

    it('should return to the previous page after updating staff record', async () => {
      const { fixture, postStaffSpy, routerSpy } = await setup();

      await fillInNumberAndSubmitForm('10');
      fixture.detectChanges();

      expect(postStaffSpy).toHaveBeenCalled();
      expect(routerSpy).toHaveBeenCalledWith(['workplace', mockEstablishment.uid, 'update-workplace-details']);
    });

    it('should return to the previous page if cancel link is clicked', async () => {
      const { getByText, routerSpy } = await setup();

      userEvent.click(getByText('Cancel'));
      expect(routerSpy).toHaveBeenCalledWith(['workplace', mockEstablishment.uid, 'update-workplace-details']);
    });

    const fillInNumberAndSubmitForm = async (inputString: string) => {
      const numberInput = screen.getByLabelText('Number of staff');
      userEvent.clear(numberInput);
      userEvent.type(numberInput, inputString);
      userEvent.click(screen.getByRole('button', { name: 'Save and return' }));
    };

    const expectErrorMessageAppears = (errorMessage: string) => {
      const errorBoxTitle = screen.getByText('There is a problem');
      expect(errorBoxTitle).toBeTruthy();

      const errorSummaryBox = errorBoxTitle.parentElement;
      expect(within(errorSummaryBox).getByText(errorMessage)).toBeTruthy();

      const inlineErrorMessage = within(screen.getByText('Number of staff').parentElement).getByText(errorMessage);
      expect(inlineErrorMessage).toBeTruthy();
    };
  });
});
