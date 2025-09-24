import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { WorkplaceDataOwner } from '@core/model/my-workplaces.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import { of } from 'rxjs';

import { Establishment } from '../../../../mockdata/establishment';
import { ChangeDataOwnerComponent } from './change-data-owner.component';

const parentValues = {
  id: 6,
  name: 'Parent Workplace',
  postcode: 'L20 9LY',
  uid: 'test-id-2',
};

const subValues = {
  id: 1,
  uid: 'workplace-id-1',
  name: 'Test Workplace',
  postcode: 'AB1 2CD',
  isParent: false,
  parentName: parentValues.name,
  parentPostcode: parentValues.postcode,
  parentUid: parentValues.uid,
};

const subsidiaryOwnsData = {
  ...Establishment,
  id: subValues.id,
  uid: subValues.uid,
  name: subValues.name,
  postcode: subValues.postcode,
  dataOwner: 'Workplace',
  dataOwnershipRequested: null,
  dataPermissions: 'None',
  isParent: false,
  parentName: subValues.parentName,
  parentPostcode: subValues.parentPostcode,
  parentUid: subValues.parentUid,
};

const subsidiaryDoesNotOwnData = {
  ...Establishment,
  id: subValues.id,
  uid: subValues.uid,
  name: subValues.name,
  postcode: subValues.postcode,
  dataOwner: WorkplaceDataOwner.Parent,
  dataPermissions: 'Workplace and Staff',
  isParent: subValues.isParent,
  parentName: subValues.parentName,
  parentPostcode: subValues.parentPostcode,
  parentUid: subValues.parentUid,
};

const parent = {
  ...Establishment,
  id: parentValues.id,
  uid: parentValues.uid,
  name: parentValues.name,
  dataOwner: 'Workplace',
  isParent: true,
  postcode: parentValues.postcode,
  parentUid: null,
};

describe('ChangeDataOwnerComponent', async () => {
  async function setup(establishment = subsidiaryDoesNotOwnData) {
    const { getAllByText, getByRole, getByText, getByLabelText, getByTestId, fixture, queryByText } = await render(
      ChangeDataOwnerComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, ReactiveFormsModule],
        declarations: [ChangeDataOwnerComponent],
        providers: [
          AlertService,
          WindowRef,
          UntypedFormBuilder,
          ErrorSummaryService,
          { provide: PermissionsService, useClass: MockPermissionsService },
          {
            provide: BreadcrumbService,
            useClass: MockBreadcrumbService,
          },
          {
            provide: EstablishmentService,
            useClass: MockEstablishmentService,
          },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                queryParams: establishment.isParent ? { changeDataOwnerFrom: subValues.uid } : null,
                data: {
                  establishment: establishment,
                },
              },
            },
          },
        provideHttpClient(), provideHttpClientTesting(),],
        componentProperties: {},
      },
    );
    const component = fixture.componentInstance;

    const injector = getTestBed();

    const establishmentService = injector.inject(EstablishmentService);

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const alertService = injector.inject(AlertService) as AlertService;
    const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();

    return {
      getAllByText,
      getByRole,
      getByText,
      getByLabelText,
      getByTestId,
      queryByText,
      fixture,
      component,
      routerSpy,
      establishmentService,
      alertServiceSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the workplace name', async () => {
    const { component } = await setup();
    const mainHeadingTestId = within(document.body).getByTestId('mainHeading');
    const workplaceName = component.primaryWorkplace.name;

    expect(mainHeadingTestId.textContent).toContain(workplaceName);
  });

  it('should show the main heading', async () => {
    const mainHeadingText = within(document.body).getByRole('heading', {
      name: /change data owner/i,
    });
    expect(mainHeadingText).toBeTruthy();
  });

  it('should show the main heading', async () => {
    const secondaryHeadingText = within(document.body).getByRole('heading', {
      name: /data permissions/i,
    });
    expect(secondaryHeadingText).toBeTruthy();
  });

  describe('breadcrumbs', () => {
    it('should show the journey for a sub', async () => {
      const { component } = await setup(subsidiaryDoesNotOwnData);

      expect(component.showJourneyType()).toEqual(JourneyType.CHANGE_DATA_OWNER);
    });

    it('should show the journey for a parent', async () => {
      const { component } = await setup(parent);

      expect(component.showJourneyType()).toEqual(JourneyType.ALL_WORKPLACES);
    });
  });

  describe('data owner', () => {
    describe('is the parent', async () => {
      it('should show the name and postcode of data owner', async () => {
        const { component } = await setup(subsidiaryDoesNotOwnData);

        const dataOwnerAndPostcode = `${parentValues.name}, ${parentValues.postcode}`;
        const ownershipFromNameAndPostcode = within(document.body).getByTestId('ownershipFromNameAndPostcode');

        expect(ownershipFromNameAndPostcode.textContent).toContain(dataOwnerAndPostcode);
      });

      it('should show the name of the data owner to request from', async () => {
        const { component } = await setup(subsidiaryDoesNotOwnData);

        expect(within(document.body).getByTestId('dataPermissions').textContent).toContain('Parent Workplace');
      });
    });

    describe('is the subsidiary', async () => {
      it('should show the name and postcode of data owner', async () => {
        const { component, establishmentService, fixture } = await setup(parent);

        const establishmentServiceSpy = spyOn(establishmentService, 'getEstablishment').and.callFake(() =>
          of(subsidiaryOwnsData),
        );

        component.ngOnInit();
        fixture.detectChanges();

        expect(establishmentServiceSpy).toHaveBeenCalledWith(subValues.uid);

        const dataOwnerAndPostcode = 'Test Workplace, AB1 2CD';
        const ownershipFromNameAndPostcode = within(document.body).getByTestId('ownershipFromNameAndPostcode');

        expect(ownershipFromNameAndPostcode.textContent).toContain(dataOwnerAndPostcode);
      });

      it('should show the name of the data owner to request from', async () => {
        const { component, establishmentService, fixture } = await setup(parent);

        spyOn(establishmentService, 'getEstablishment').and.callFake(() => of(subsidiaryOwnsData));

        component.ngOnInit();
        fixture.detectChanges();

        const dataPermissions = within(document.body).getByTestId('dataPermissions');
        expect(dataPermissions.textContent).toContain('Test Workplace');
      });
    });
  });

  describe('radio buttons', () => {
    it('should show the radio buttons', async () => {
      const { component, fixture } = await setup();

      const workplaceRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="Workplace"]`);
      const workplaceAndStaffRadioButton = fixture.nativeElement.querySelector(
        `input[ng-reflect-value="Workplace and Staff"]`,
      );
      const noneRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="None"]`);

      expect(workplaceRadioButton).toBeTruthy();
      expect(noneRadioButton).toBeTruthy();
      expect(workplaceAndStaffRadioButton).toBeTruthy();
    });

    it('should show the correct labels when a sub is requesting', async () => {
      const { component, fixture } = await setup(subsidiaryDoesNotOwnData);

      expect(within(document.body).getByLabelText('Only your workplace details')).toBeTruthy();
      expect(within(document.body).getByLabelText('Your workplace details and your staff records')).toBeTruthy();
      expect(within(document.body).getByLabelText('No access to your data, linked only')).toBeTruthy();
    });

    it('should show the correct labels when a parent is requesting', async () => {
      const { component, establishmentService, fixture } = await setup(parent);

      spyOn(establishmentService, 'getEstablishment').and.callFake(() => of(subsidiaryOwnsData));

      component.ngOnInit();
      fixture.detectChanges();

      expect(within(document.body).getByLabelText('Only their workplace details')).toBeTruthy();
      expect(within(document.body).getByLabelText('Their workplace details and their staff records')).toBeTruthy();
      expect(within(document.body).getByLabelText('No access to their data, linked only')).toBeTruthy();
    });
  });

  it('should show the send change request button', async () => {
    const { component, fixture } = await setup();

    const sendChangeRequestbutton = within(document.body).getByRole('button', {
      name: /send change request/i,
    });

    expect(sendChangeRequestbutton).toBeTruthy();
  });

  describe('cancel link', () => {
    it('should show with the correct href back to the home tab if sub is requesting', async () => {
      const { component, fixture } = await setup();
      const cancelLink = within(document.body).getByTestId('cancelLink');

      expect(cancelLink).toBeTruthy();
      expect(cancelLink.getAttribute('href')).toEqual('/dashboard');
    });

    it('should show with the correct href back to the your other workplaces if parent is requesting', async () => {
      const { component, fixture } = await setup(parent);

      const cancelLink = within(document.body).getByTestId('cancelLink');

      expect(cancelLink).toBeTruthy();
      expect(cancelLink.getAttribute('href')).toEqual('/workplace/view-all-workplaces');
    });
  });

  it('should show error message when nothing is submitted', async () => {
    const { component, fixture } = await setup();

    const sendChangeRequestButton = within(document.body).getByText('Send change request');

    const dataPermissionErrorMessage = 'Select which data permission you want them to have';
    const form = component.form;

    fireEvent.click(sendChangeRequestButton);
    fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(within(document.body).getAllByText(dataPermissionErrorMessage).length).toEqual(2);
  });

  it('should submit the change data owner request', async () => {
    const { component, fixture, establishmentService } = await setup();

    const establishmentServiceSpy = spyOn(establishmentService, 'changeOwnership').and.callThrough();

    component.ngOnInit();
    fixture.detectChanges();

    const noneRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="None"]`);
    fireEvent.click(noneRadioButton);

    const sendChangeRequestbutton = within(document.body).getByText('Send change request');
    fireEvent.click(sendChangeRequestbutton);
    fixture.detectChanges();

    expect(establishmentServiceSpy).toHaveBeenCalled();
  });

  it('should navigate back to the home page if they are a sub', async () => {
    const { component, fixture, establishmentService, alertServiceSpy, routerSpy } = await setup();

    spyOn(establishmentService, 'changeOwnership').and.callThrough();

    component.ngOnInit();
    fixture.detectChanges();

    const noneRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="None"]`);
    fireEvent.click(noneRadioButton);

    const sendChangeRequestbutton = within(document.body).getByText('Send change request');
    fireEvent.click(sendChangeRequestbutton);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], {
      state: {
        changeDataOwnerStatus: true,
      },
    });

    fixture.whenStable().then(() => {
      expect(alertServiceSpy).toHaveBeenCalledWith({
        type: 'success',
        message: "You've sent a change data owner request",
      });
    });
  });

  it('should navigate back to the home page if they are a parent', async () => {
    const { component, fixture, alertServiceSpy, routerSpy, establishmentService } = await setup(parent);

    spyOn(establishmentService, 'getEstablishment').and.callFake(() => of(subsidiaryOwnsData));

    component.ngOnInit();
    fixture.detectChanges();

    spyOn(establishmentService, 'changeOwnership').and.callThrough();

    fixture.detectChanges();

    const noneRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="None"]`);
    fireEvent.click(noneRadioButton);

    const sendChangeRequestbutton = within(document.body).getByText('Send change request');
    fireEvent.click(sendChangeRequestbutton);

    expect(routerSpy).toHaveBeenCalledWith(['/workplace/view-all-workplaces'], {
      state: {
        changeDataOwnerStatus: true,
      },
    });

    fixture.whenStable().then(() => {
      expect(alertServiceSpy).toHaveBeenCalledWith({
        type: 'success',
        message: "You've sent a change data owner request",
      });
    });
  });
});