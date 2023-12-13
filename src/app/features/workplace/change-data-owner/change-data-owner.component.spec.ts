import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockBenchmarksService } from '@core/test-utils/MockBenchmarkService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { fireEvent, getByText, render } from '@testing-library/angular';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { Establishment } from '../../../../mockdata/establishment';
import { SharedModule } from '@shared/shared.module';
import { getTestBed } from '@angular/core/testing';
import { AlertService } from '@core/services/alert.service';
import { WindowRef } from '@core/services/window.ref';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { WorkplaceDataOwner } from '@core/model/my-workplaces.model';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

import { ChangeDataOwnerComponent } from './change-data-owner.component';

describe('ChangeDataOwnerComponent', () => {
  const mockparent = {
    parentName: 'Test 2',
    parentPostcode: 'L20 9LY',
    uid: 'test-id-2',
  };

  async function setup(
    dataOwner = 'Parent',
    isParent = false,
    parentName = mockparent.parentName,
    parentUid = mockparent.uid,
    parentPostcode = mockparent.parentPostcode,
  ) {
    const {
      getAllByText,
      getByRole,
      getByText,
      getByLabelText,
      getByTestId,
      findAllByText,
      findByText,
      fixture,
      queryByText,
    } = await render(ChangeDataOwnerComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      declarations: [],
      providers: [
        AlertService,
        WindowRef,
        UntypedFormBuilder,
        ErrorSummaryService,
        { provide: BenchmarksService, useClass: MockBenchmarksService },
        { provide: PermissionsService, useClass: MockPermissionsService },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: EstablishmentService,
          useValue: {
            primaryWorkplace: {
              name: 'Workplace sub',
              dataOwner: dataOwner,
              isParent: isParent,
              uid: 'someuid',
              parentName: parentName,
              parentUid: parentUid,
              parentPostcode: parentPostcode,
            },
          },
          //useClass: MockEstablishmentService,
        },
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
      ],
      componentProperties: {},
    });
    const component = fixture.componentInstance;

    const parentRequestsService = TestBed.inject(ParentRequestsService);

    const establishmentService = TestBed.inject(EstablishmentService);

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      getAllByText,
      getByRole,
      getByText,
      getByLabelText,
      getByTestId,
      queryByText,
      findByText,
      findAllByText,
      fixture,
      component,
      routerSpy,
      parentRequestsService,
      establishmentService,
      //getAllParentWithPostCodeSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('breadcrumbs', () => {
    it('should show the journey for a sub', async () => {
      const { component, queryByText } = await setup();

      const workplacesBreadcrumbs = queryByText('Your other workplaces');
      expect(workplacesBreadcrumbs).toBeFalsy();

      expect(component.journeyType).toEqual(JourneyType.CHANGE_DATA_OWNER);
    });

    it('should show the journey for a parent', async () => {
      const { component } = await setup('Workplace', true);

      expect(component.journeyType).toEqual(JourneyType.ALL_WORKPLACES);
    });
  });

  it('should show the workplace name', async () => {
    const { component, getByTestId } = await setup();

    const mainHeadingTestId = getByTestId('mainHeading');
    const workplaceName = component.primaryWorkplace.name;

    expect(mainHeadingTestId.textContent).toContain(workplaceName);
  });

  it('should show the main heading', async () => {
    const { getByRole } = await setup();

    const mainHeadingText = getByRole('heading', {
      name: /change data owner/i,
    });
    expect(mainHeadingText).toBeTruthy();
  });

  it('should show the main heading', async () => {
    const { component, getByRole } = await setup();

    const secondaryHeadingText = getByRole('heading', {
      name: /data permissions/i,
    });
    expect(secondaryHeadingText).toBeTruthy();
  });

  describe('data owner', () => {
    describe('is workplace', () => {
      it('should show the name of the data owner to request from', async () => {
        const { component, getByTestId, getByText, fixture, establishmentService } = await setup(
          'Workplace',
          true,
          null,
          null,
        );

        expect(getByTestId('dataPermissions').textContent).toContain('Workplace sub');
      });
    });

    describe('is parent', () => {
      xit('should show the name of the data owner and postcode', async () => {
        const { component, getByText, fixture } = await setup();

        //const dataOwnerAndPostcode = mockparentsWithPostCode[1].parentNameAndPostalcode;

        //expect(getByText(dataOwnerAndPostcode)).toBeTruthy();
      });

      it('should show the name of the data owner to request from', async () => {
        const { component, getByTestId, getByText, fixture, establishmentService } = await setup();

        expect(getByTestId('dataPermissions').textContent).toContain('Test 2');
      });
    });
  });

  it('should show the radio buttons', async () => {
    const { fixture } = await setup();

    const workplaceRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="Workplace"]`);
    const workplaceAndStaffRadioButton = fixture.nativeElement.querySelector(
      `input[ng-reflect-value="Workplace and Staff"]`,
    );
    const noneRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="None"]`);

    expect(workplaceRadioButton).toBeTruthy();
    expect(noneRadioButton).toBeTruthy();
    expect(workplaceAndStaffRadioButton).toBeTruthy();
  });

  describe('radio buttons', () => {
    it('should show the correct labels for a sub', async () => {
      const { getByLabelText } = await setup();

      expect(getByLabelText('Only your workplace details')).toBeTruthy();
      expect(getByLabelText('Your workplace details and your staff records')).toBeTruthy();
      expect(getByLabelText('No access to your data, linked only')).toBeTruthy();
    });

    it('should show the correct labels for a parent', async () => {
      const { getByLabelText } = await setup('Workplace', true);

      expect(getByLabelText('Only their workplace details')).toBeTruthy();
      expect(getByLabelText('Their workplace details and their staff records')).toBeTruthy();
      expect(getByLabelText('No access to their data, linked only')).toBeTruthy();
    });
  });

  it('should show the send change request button', async () => {
    const { component, getByRole } = await setup();

    const button = getByRole('button', {
      name: /send change request/i,
    });

    expect(button).toBeTruthy();
  });

  describe('cancel link', () => {
    it('should show with the correct href back to the home tab', async () => {
      const { getByRole } = await setup();

      const cancelLink = getByRole('link', {
        name: /cancel/i,
      });

      expect(cancelLink).toBeTruthy();
      expect(cancelLink.getAttribute('href')).toEqual('/dashboard');
    });

    it('should show with the correct href back to the your other workplaces', async () => {
      const { getByRole } = await setup('Workplace', true);

      const cancelLink = getByRole('link', {
        name: /cancel/i,
      });

      expect(cancelLink).toBeTruthy();
      expect(cancelLink.getAttribute('href')).toEqual('/workplace/view-all-workplaces');
    });
  });

  it('should show error message when nothing is submitted', async () => {
    const { component, fixture, getByText, getAllByText } = await setup();

    const sendChangeRequestButton = getByText('Send change request');

    const dataPermissionErrorMessage = 'Select which data permission you want them to have';
    const form = component.form;

    fireEvent.click(sendChangeRequestButton);
    fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(getAllByText(dataPermissionErrorMessage).length).toEqual(2);
  });
});
