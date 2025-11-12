import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { WindowRef } from '@core/services/window.ref';
import { establishmentBuilder, MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { TotalStaffChangeComponent } from './total-staff-change.component';
import { getTestBed } from '@angular/core/testing';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithOverrides } from '@core/test-utils/MockWorkerService';
import { of } from 'rxjs';

describe('TotalStaffChangeComponent', () => {
  const establishment = establishmentBuilder() as Establishment;

  async function setup(overrides: any = {}) {
    const setupTools = await render(TotalStaffChangeComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      declarations: [],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        UntypedFormBuilder,
        {
          provide: WorkerService,
          useFactory: MockWorkerServiceWithOverrides.factory({
            totalStaffReturn: overrides.totalStaffReturn ?? true,
            returnTo: overrides.returnTo ?? null,
          }),
        },
        {
          provide: WindowRef,
          useValue: WindowRef,
        },
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceWithOverrides.factory({
            establishment: {
              numberOfStaff: overrides.numberOfStaff ?? 1,
            },
          }),
          deps: [HttpClient],
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              url: [{ path: 1 }, { path: 2 }],
            },
            parent: {
              snapshot: {
                url: [{ path: 'workplace' }],
                data: {
                  establishment,
                  primaryWorkplace: establishment,
                },
              },
            },
          },
        },
      provideHttpClient(), provideHttpClientTesting(),],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const router = injector.inject(Router) as Router;
    const updateEstablishmentFieldWithAuditSpy = spyOn(
      establishmentService,
      'updateEstablishmentFieldWithAudit',
    ).and.callFake((_uid, _property, { numberOfStaff }) => {
      return of({ ...establishment, numberOfStaff });
    });

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      ...setupTools,
      component,
      establishmentService,
      updateEstablishmentFieldWithAuditSpy,
      routerSpy,
    };
  }

  it('should render a TotalStaffChange component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should show a page heading', async () => {
      const { getByRole } = await setup();

      const expectedHeading = 'Add the total number of staff for your workplace';
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

    it('should show a Save and return button and a Cancel link if returnToDash is true', async () => {
      const { getByRole, getByText } = await setup();

      expect(getByRole('button', { name: 'Save and return' })).toBeTruthy();

      const cancelLink = getByText('Cancel');
      expect(cancelLink).toBeTruthy();
    });

    it('should show a Save and continue button and a Cancel link if returnToDash is false', async () => {
      const { getByRole, getByText } = await setup({ totalStaffReturn: false, returnTo: null });

      expect(getByRole('button', { name: 'Save and continue' })).toBeTruthy();

      const cancelLink = getByText('Cancel');
      expect(cancelLink).toBeTruthy();
    });
  });

  it('should call the updateEstablishmentFieldWithAuditSpy endpoint when submitting', async () => {
    const { component, fixture, updateEstablishmentFieldWithAuditSpy } = await setup({
      numberOfStaff: 5,
    });

    await fillInNumberAndSubmitForm('10');
    fixture.detectChanges();

    expect(updateEstablishmentFieldWithAuditSpy).toHaveBeenCalledWith(component.workplace.uid, 'NumberOfStaff', {
      numberOfStaff: 10,
    });
  });

  it('should update numberOfStaff in establishment service if backend call is successful', async () => {
    const { fixture, establishmentService } = await setup({ numberOfStaff: 5 });

    const setStateSpy = spyOn(establishmentService, 'setState');

    await fillInNumberAndSubmitForm('10');
    fixture.detectChanges();

    expect(setStateSpy).toHaveBeenCalledWith(establishment);
  });

  describe('routing', () => {
    it('should navigate to the staff records page', async () => {
      const { fixture, routerSpy } = await setup();

      await fillInNumberAndSubmitForm('10');
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'staff-records' });
    });

    it('should navigate to the url set in returnTo', async () => {
      const { routerSpy } = await setup({ totalStaffReturn: false, returnTo: { url: ['/dashboard'] } });

      await fillInNumberAndSubmitForm('10');

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should navigate to the create-staff-record page', async () => {
      const { component, routerSpy } = await setup({ totalStaffReturn: false, returnTo: null });

      await fillInNumberAndSubmitForm('10', 'Save and continue');

      expect(routerSpy).toHaveBeenCalledWith(['create-staff-record'], { relativeTo: component.route.parent });
    });
  });

  const fillInNumberAndSubmitForm = async (input: string, buttonText: string = 'Save and return') => {
    const numberInput = screen.getByLabelText('Number of staff');

    userEvent.clear(numberInput);
    userEvent.type(numberInput, input);

    const button = screen.getByText(buttonText);
    fireEvent.click(button);
  };
});