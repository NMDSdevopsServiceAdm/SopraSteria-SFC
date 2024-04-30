import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { WorkplaceDataOwner } from '@core/model/my-workplaces.model';
import { AlertService } from '@core/services/alert.service';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBenchmarksService } from '@core/test-utils/MockBenchmarkService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, within } from '@testing-library/angular';
import { of } from 'rxjs';

import { Establishment as MockEstablishment } from '../../../../mockdata/establishment';
import { ChangeDataOwnerComponent } from './change-data-owner.component';

describe('ChangeDataOwnerComponent', async () => {
  let component: ChangeDataOwnerComponent;
  let fixture: ComponentFixture<ChangeDataOwnerComponent>;

  const mockParent = {
    parentName: 'Parent Workplace',
    parentPostcode: 'L20 9LY',
    uid: 'test-id-2',
  };

  describe('', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        declarations: [ChangeDataOwnerComponent],
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
                name: 'Primary Workplace',
                dataOwner: WorkplaceDataOwner.Parent,
                isParent: false,
                postcode: 'WP1 1AA',
                uid: 'someuid',
                parentName: mockParent.parentName,
                parentUid: mockParent.uid,
                parentPostcode: mockParent.parentPostcode,
              },
            },
          },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                queryParams: { changeDataOwnerFrom: 'workplace-id-1' },
                data: {
                  childWorkplaces: {
                    childWorkplaces: [
                      {
                        dataOwner: 'Workplace',
                        dataOwnershipRequested: null,
                        dataPermissions: 'Workplace and Staff',
                        name: 'Sub Workplace 1',
                        postcode: 'WP1 1AA',
                        uid: 'workplace-id-1',
                        ustatus: null,
                      },
                      {
                        dataOwner: 'Workplace',
                        dataOwnershipRequested: null,
                        dataPermissions: 'Workplace and Staff',
                        name: 'Sub Workplace 2',
                        postcode: 'WP2 2BB',
                        uid: 'workplace-id-2',
                        ustatus: null,
                      },
                    ],
                  },
                },
              },
            },
          },
          {
            provide: FeatureFlagsService,
            useClass: MockFeatureFlagsService,
          },
        ],
      });
      //.compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(ChangeDataOwnerComponent);
      component = fixture.componentInstance;
      component.primaryWorkplace = MockEstablishment as Establishment;

      fixture.detectChanges();
    });

    it('should create', async () => {
      expect(component).toBeTruthy();
    });

    describe('breadcrumbs', () => {
      it('should show the journey for a sub', async () => {
        expect(component.journeyType).toEqual(JourneyType.CHANGE_DATA_OWNER);
      });

      it('should show the journey for a parent', async () => {
        component.primaryWorkplace.dataOwner = WorkplaceDataOwner.Workplace;
        component.primaryWorkplace.isParent = true;

        component.ngOnInit();
        fixture.detectChanges();
        expect(component.journeyType).toEqual(JourneyType.ALL_WORKPLACES);
      });
    });

    it('should show the workplace name', async () => {
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

    describe('data owner', () => {
      describe('is the parent', async () => {
        it('should show the name and postcode of data owner', async () => {
          const dataOwnerAndPostcode = 'Parent Workplace, L20 9LY';
          const ownershipFromNameAndPostcode = within(document.body).getByTestId('ownershipFromNameAndPostcode');

          expect(ownershipFromNameAndPostcode.textContent).toContain(dataOwnerAndPostcode);
        });

        it('should show the name of the data owner to request from', async () => {
          expect(within(document.body).getByTestId('dataPermissions').textContent).toContain('Parent Workplace');
        });
      });

      describe('is the subsidiary', async () => {
        it('should show the name and postcode of data owner', async () => {
          component.primaryWorkplace.dataOwner = WorkplaceDataOwner.Workplace;
          component.primaryWorkplace.isParent = true;
          component.primaryWorkplace.postcode = mockParent.parentPostcode;
          component.primaryWorkplace.parentName = null;
          component.primaryWorkplace.parentUid = null;
          component.primaryWorkplace.parentPostcode = null;

          component.ngOnInit();
          fixture.detectChanges();

          const dataOwnerAndPostcode = 'Sub Workplace 1, WP1 1AA';
          const ownershipFromNameAndPostcode = within(document.body).getByTestId('ownershipFromNameAndPostcode');

          expect(ownershipFromNameAndPostcode.textContent).toContain(dataOwnerAndPostcode);
        });

        it('should show the name of the data owner to request from', async () => {
          component.primaryWorkplace.dataOwner = WorkplaceDataOwner.Workplace;
          component.primaryWorkplace.isParent = true;
          component.primaryWorkplace.postcode = mockParent.parentPostcode;
          component.primaryWorkplace.parentName = null;
          component.primaryWorkplace.parentUid = null;
          component.primaryWorkplace.parentPostcode = null;

          component.ngOnInit();
          fixture.detectChanges();

          const dataPermissions = within(document.body).getByTestId('dataPermissions');
          expect(dataPermissions.textContent).toContain('Sub Workplace 1');
        });
      });
    });

    describe('radio buttons', () => {
      it('should show the radio buttons', async () => {
        const workplaceRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="Workplace"]`);
        const workplaceAndStaffRadioButton = fixture.nativeElement.querySelector(
          `input[ng-reflect-value="Workplace and Staff"]`,
        );
        const noneRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="None"]`);

        expect(workplaceRadioButton).toBeTruthy();
        expect(noneRadioButton).toBeTruthy();
        expect(workplaceAndStaffRadioButton).toBeTruthy();
      });

      it('should show the correct labels for a sub', async () => {
        expect(within(document.body).getByLabelText('Only your workplace details')).toBeTruthy();
        expect(within(document.body).getByLabelText('Your workplace details and your staff records')).toBeTruthy();
        expect(within(document.body).getByLabelText('No access to your data, linked only')).toBeTruthy();
      });

      it('should show the correct labels for a parent', async () => {
        component.primaryWorkplace.dataOwner = WorkplaceDataOwner.Workplace;
        component.primaryWorkplace.isParent = true;
        component.primaryWorkplace.postcode = mockParent.parentPostcode;
        component.primaryWorkplace.parentName = null;
        component.primaryWorkplace.parentUid = null;
        component.primaryWorkplace.parentPostcode = null;

        component.ngOnInit();
        fixture.detectChanges();

        expect(within(document.body).getByLabelText('Only their workplace details')).toBeTruthy();
        expect(within(document.body).getByLabelText('Their workplace details and their staff records')).toBeTruthy();
        expect(within(document.body).getByLabelText('No access to their data, linked only')).toBeTruthy();
      });
    });

    it('should show the send change request button', async () => {
      const sendChangeRequestbutton = within(document.body).getByRole('button', {
        name: /send change request/i,
      });

      expect(sendChangeRequestbutton).toBeTruthy();
    });

    describe('cancel link', () => {
      it('should show with the correct href back to the home tab', async () => {
        const cancelLink = within(document.body).getByTestId('cancelLink');

        expect(cancelLink).toBeTruthy();
        expect(cancelLink.getAttribute('href')).toEqual('/dashboard');
      });

      it('should show with the correct href back to the your other workplaces', async () => {
        component.primaryWorkplace.dataOwner = WorkplaceDataOwner.Workplace;
        component.primaryWorkplace.isParent = true;

        component.ngOnInit();
        fixture.detectChanges();

        const cancelLink = within(document.body).getByTestId('cancelLink');

        expect(cancelLink).toBeTruthy();
        expect(cancelLink.getAttribute('href')).toEqual('/workplace/view-all-workplaces');
      });
    });

    it('should show error message when nothing is submitted', async () => {
      const sendChangeRequestButton = within(document.body).getByText('Send change request');

      const dataPermissionErrorMessage = 'Select which data permission you want them to have';
      const form = component.form;

      fireEvent.click(sendChangeRequestButton);
      fixture.detectChanges();

      expect(form.invalid).toBeTruthy();
      expect(within(document.body).getAllByText(dataPermissionErrorMessage).length).toEqual(2);
    });
  });

  describe('', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        declarations: [ChangeDataOwnerComponent],
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
            useClass: MockEstablishmentService,
          },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                queryParams: { changeDataOwnerFrom: 'workplace-id-1' },
                data: {
                  childWorkplaces: {
                    childWorkplaces: [
                      {
                        dataOwner: 'Workplace',
                        dataOwnershipRequested: null,
                        dataPermissions: 'Workplace and Staff',
                        name: 'Sub Workplace 1',
                        postcode: 'WP1 1AA',
                        uid: 'workplace-id-1',
                        ustatus: null,
                      },
                      {
                        dataOwner: 'Workplace',
                        dataOwnershipRequested: null,
                        dataPermissions: 'Workplace and Staff',
                        name: 'Sub Workplace 2',
                        postcode: 'WP2 2BB',
                        uid: 'workplace-id-2',
                        ustatus: null,
                      },
                    ],
                  },
                },
              },
            },
          },
          {
            provide: FeatureFlagsService,
            useClass: MockFeatureFlagsService,
          },
        ],
      });
      //.compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(ChangeDataOwnerComponent);
      component = fixture.componentInstance;
      component.primaryWorkplace = MockEstablishment;
    });

    it('should submit the change data owner request', async () => {
      const establishmentService = TestBed.inject(EstablishmentService);
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
      const establishmentService = TestBed.inject(EstablishmentService);
      spyOn(establishmentService, 'changeOwnership').and.callThrough();

      const injector = getTestBed();

      const router = injector.inject(Router) as Router;

      const message = "You've sent a change data owner request"

      const alertService = TestBed.inject(AlertService);
      type AlertType = 'success' | 'warning' | 'pending';
      const type = 'success' as AlertType

      const alert = {type: type, message: message}
      const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();
      spyOnProperty(alertService, 'alert$', 'get').and.returnValue(of(alert));

      const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
      component.ngOnInit();
      fixture.detectChanges();

      const noneRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="None"]`);
      fireEvent.click(noneRadioButton);

      const sendChangeRequestbutton = within(document.body).getByText('Send change request');
      fireEvent.click(sendChangeRequestbutton);
      fixture.detectChanges();

      expect(alertServiceSpy).toHaveBeenCalledWith({
        type: 'success',
        message: message,
      });

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], {
        state: {
          changeDataOwnerStatus: true,
        },
      });
    });

    it('should navigate back to the home page if they are a parent', async () => {
      const establishmentService = TestBed.inject(EstablishmentService);
      spyOn(establishmentService, 'changeOwnership').and.callThrough();

      const injector = getTestBed();

      const router = injector.inject(Router) as Router;

      const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

      component.primaryWorkplace.dataOwner = WorkplaceDataOwner.Workplace;
      component.primaryWorkplace.isParent = true;
      component.primaryWorkplace.postcode = mockParent.parentPostcode;
      component.primaryWorkplace.parentName = null;
      component.primaryWorkplace.parentUid = null;
      component.primaryWorkplace.parentPostcode = null;

      fixture.detectChanges();

      component.isParent = true;
      fixture.detectChanges();

      const noneRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="None"]`);
      fireEvent.click(noneRadioButton);

      const sendChangeRequestbutton = within(document.body).getByText('Send change request');
      fireEvent.click(sendChangeRequestbutton);

      expect(routerSpy).toHaveBeenCalledWith(['/workplace/view-all-workplaces'], {
        state: {
          alertMessage: "You've sent a change data owner request",
          changeDataOwnerStatus: true,
        },
      });
    });
  });
});
