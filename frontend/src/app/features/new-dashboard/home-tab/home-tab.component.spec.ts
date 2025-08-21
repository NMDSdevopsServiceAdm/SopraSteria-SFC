import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Meta } from '@core/model/benchmarks.model';
import { Roles } from '@core/model/roles.enum';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { AlertService } from '@core/services/alert.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TabsService } from '@core/services/tabs.service';
import { UserService } from '@core/services/user.service';
import { WindowToken } from '@core/services/window';
import { WindowRef } from '@core/services/window.ref';
import { MockEstablishmentServiceCheckCQCDetails } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { NewArticleListComponent } from '@features/articles/new-article-list/new-article-list.component';
import { OwnershipChangeMessageDialogComponent } from '@shared/components/ownership-change-message/ownership-change-message-dialog.component';
import { SummarySectionComponent } from '@shared/components/summary-section/summary-section.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import { of } from 'rxjs';

import { Establishment } from '../../../../mockdata/establishment';
import { NewDashboardHeaderComponent } from '../../../shared/components/new-dashboard-header/dashboard-header.component';
import { NewHomeTabComponent } from './home-tab.component';

describe('NewHomeTabComponent', () => {
  const setup = async (
    checkCqcDetails = false,
    establishment = Establishment,
    comparisonDataAvailable = true,
    noOfWorkplaces = 9,
    overrides: any = {},
  ) => {
    const dataLayerPushSpy = jasmine.createSpy();
    const MockWindow = {
      dataLayer: {
        push: dataLayerPushSpy,
      },
    };

    const setupTools = await render(NewHomeTabComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule],
      providers: [
        WindowRef,
        AlertService,
        DialogService,
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(
            overrides?.permissions ?? ['canViewEstablishment', 'canViewListOfWorkers'],
          ),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(1, overrides.userRole ?? Roles.Edit),
          deps: [HttpClient],
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                workers: {
                  workersCreatedDate: [],
                  workerCount: 0,
                  trainingCounts: {} as TrainingCounts,
                  workersNotCompleted: [],
                },
              },
            },
            queryParams: of({ view: null }),
            url: of(null),
          },
        },
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceCheckCQCDetails.factory(checkCqcDetails),
          deps: [HttpClient],
        },
        { provide: WindowToken, useValue: MockWindow },
      ],
      declarations: [
        NewDashboardHeaderComponent,
        NewArticleListComponent,
        SummarySectionComponent,
        OwnershipChangeMessageDialogComponent,
      ],
      componentProperties: {
        workplace: establishment,
        meta: comparisonDataAvailable
          ? { workplaces: noOfWorkplaces, staff: 4, localAuthority: 'Test LA' }
          : ({ workplaces: 0, staff: 0, localAuthority: 'Test LA' } as Meta),
      },
      schemas: [NO_ERRORS_SCHEMA],
    });

    const component = setupTools.fixture.componentInstance;

    const alertService = TestBed.inject(AlertService);
    const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();

    const parentsRequestService = TestBed.inject(ParentRequestsService);

    const tabsService = TestBed.inject(TabsService);
    const tabsServiceSpy = spyOnProperty(tabsService, 'selectedTab', 'set');

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      ...setupTools,
      component,
      alertServiceSpy,
      parentsRequestService,
      tabsServiceSpy,
      routerSpy,
      dataLayerPushSpy,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show articles list', async () => {
    const { getByTestId } = await setup();
    expect(getByTestId('article-list')).toBeTruthy();
  });

  describe('Other links', () => {
    describe('Get your ASC-WDS certificate link', () => {
      it('should render the link with the correct href', async () => {
        const { getByText } = await setup();
        const link = getByText('Get your ASC-WDS certificate');
        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual('/asc-wds-certificate');
      });
    });

    describe('Bulk upload your data', () => {
      it('should render the link with the correct href when can bulk upload is true', async () => {
        const { getByText, component, fixture } = await setup();
        component.canBulkUpload = true;
        fixture.detectChanges();
        const link = getByText('Bulk upload your data');
        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual('/bulk-upload');
      });

      it('should not render the link with the correct href when can bulk upload is false', async () => {
        const { queryByText, component, fixture } = await setup();
        component.canBulkUpload = false;
        fixture.detectChanges();
        expect(queryByText('Bulk upload your data')).toBeFalsy();
      });
    });

    describe('Does your data meet funding requirements card', () => {
      it('should render the funding card with link to wdf section', async () => {
        const overrides = {
          permissions: ['canViewEstablishment', 'canViewListOfWorkers', 'canViewWdfReport'],
        };

        const { getByText } = await setup(false, Establishment, true, 9, overrides);

        const link = getByText('Does your data meet funding requirements?');
        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual('/funding');
      });

      it('should not render the funding card or link when view reports is false', async () => {
        const { queryByText } = await setup();

        expect(queryByText('Does your data meet funding requirements?')).toBeFalsy();
      });
    });

    describe('About ASC-WDS link', () => {
      it('should render the link with the correct href', async () => {
        const { getByText } = await setup();
        const link = getByText('About ASC-WDS');
        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual('/about-ascwds');
      });
    });

    describe('Link to my parent organisation', () => {
      it('should not show Link to a parent workplace pending before requesting', async () => {
        const { component, fixture, queryByText } = await setup();

        component.workplace.isParent = false;
        component.canLinkToParent = true;
        component.canBecomeAParent = true;
        component.linkToParentRequestedStatus = false;
        component.parentStatusRequested = false;

        fixture.detectChanges();

        const expectedMessage = 'Link to a parent workplace (request pending)';
        expect(queryByText(expectedMessage)).toBeFalsy();
        expect(queryByText('Link to a parent workplace')).toBeTruthy();
        expect(queryByText(`Become a parent and manage other workplaces' data`)).toBeTruthy();
      });

      it('should show the link to parent link with the correct href', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.isParent = false;
        component.canLinkToParent = true;
        component.canBecomeAParent = true;
        component.linkToParentRequestedStatus = false;
        component.parentStatusRequested = false;

        fixture.detectChanges();

        const linkToParentLink = getByText('Link to a parent workplace');
        expect(linkToParentLink).toBeTruthy();
        expect(linkToParentLink.getAttribute('href')).toEqual('/link-to-parent');
      });

      it('should show Link to a parent workplace pending after requesting', async () => {
        const { component, fixture, queryByText } = await setup();

        component.workplace.isParent = false;
        component.canLinkToParent = true;
        component.linkToParentRequestedStatus = true;

        fixture.detectChanges();

        const linkToParentPendingLink = queryByText('Link to a parent workplace (request pending)');
        expect(linkToParentPendingLink).toBeTruthy();
        expect(linkToParentPendingLink.getAttribute('href')).toEqual('/link-to-parent');

        expect(queryByText('Link to a parent workplace')).toBeFalsy();
        expect(queryByText(`Become a parent and manage other workplaces' data`)).toBeFalsy();
      });
    });

    describe('Become a parent organisation', () => {
      it('should show become a parent and manage link and not show Link to a parent workplace pending before requesting', async () => {
        const { component, fixture, queryByText } = await setup();

        component.workplace.isParent = false;
        component.canLinkToParent = true;
        component.canBecomeAParent = true;
        component.linkToParentRequestedStatus = false;
        component.parentStatusRequested = false;

        fixture.detectChanges();

        const expectedMessage = 'Link to my parent organisation pending';
        expect(queryByText(expectedMessage)).toBeFalsy();
        expect(queryByText('Link to a parent workplace')).toBeTruthy();
        expect(queryByText(`Become a parent and manage other workplaces' data`)).toBeTruthy();
      });

      it('should show the become a parent link with the correct href', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.isParent = false;
        component.canLinkToParent = true;
        component.canBecomeAParent = true;
        component.linkToParentRequestedStatus = false;
        component.parentStatusRequested = false;

        fixture.detectChanges();

        const becomeAParentlink = getByText(`Become a parent and manage other workplaces' data`);
        expect(becomeAParentlink).toBeTruthy();
        expect(becomeAParentlink.getAttribute('href')).toEqual('/become-a-parent');
      });

      it('should show the become a parent pending request link with the correct href', async () => {
        const { component, fixture, getByText, queryByText } = await setup();

        component.workplace.isParent = false;
        component.canBecomeAParent = true;
        component.linkToParentRequestedStatus = false;
        component.parentStatusRequested = true;

        fixture.detectChanges();

        const becomeAParentPendinglink = getByText(
          `Become a parent and manage other workplaces' data (request pending)`,
        );
        expect(becomeAParentPendinglink).toBeTruthy();
        expect(queryByText('Link to my parent organisation')).toBeFalsy();
        expect(becomeAParentPendinglink.getAttribute('href')).toEqual('/become-a-parent');
      });
    });

    describe('Data owner', () => {
      it('should not show a link if canViewChangeDataOwner is false', async () => {
        const { component, fixture, queryByText } = await setup();

        component.canViewChangeDataOwner = false;
        fixture.detectChanges();

        expect(queryByText('Change data owner')).toBeFalsy();
        expect(queryByText('Data request pending')).toBeFalsy();
      });

      describe('isOwnershipRequested is false', () => {
        it('shows "Change data owner" when isOwnershipRequested is false', async () => {
          const { component, fixture, getByText } = await setup();

          component.isOwnershipRequested = false;
          fixture.detectChanges();

          expect(getByText('Change data owner')).toBeTruthy();
        });

        it('should show change data owner with the correct href', async () => {
          const { component, fixture, getByText } = await setup();

          component.isOwnershipRequested = false;
          fixture.detectChanges();

          const changeDataOwnerLink = getByText('Change data owner');

          fireEvent.click(changeDataOwnerLink);
          fixture.detectChanges();

          expect(changeDataOwnerLink.getAttribute('href')).toEqual('/workplace/change-data-owner');
        });
      });

      it('shows "data request pending" when ownership has been requested', async () => {
        const { component, fixture, getByText } = await setup();

        component.isOwnershipRequested = true;
        fixture.detectChanges();

        expect(getByText('Data request pending')).toBeTruthy();
      });
    });

    describe('set data permissions', () => {
      it('does not show the set data permissions link if canViewDataPermissionsLink is false', async () => {
        const { component, fixture, queryByText } = await setup();

        component.canViewDataPermissionsLink = false;
        fixture.detectChanges();
        const setDataPermissionsLink = queryByText('Set data permissions');

        expect(setDataPermissionsLink).toBeFalsy();
      });

      it('shows the set data permissions link if canViewDataPermissionsLink is true', async () => {
        const { component, fixture, getByText } = await setup();

        component.canViewDataPermissionsLink = true;
        fixture.detectChanges();
        const setDataPermissionsLink = getByText('Set data permissions');

        expect(setDataPermissionsLink).toBeTruthy();
      });

      it('should show a dialog to set data permissions', async () => {
        const { component, fixture, getByText } = await setup();

        component.canViewDataPermissionsLink = true;
        fixture.detectChanges();

        const setDataPermissionsLink = getByText('Set data permissions');

        fireEvent.click(setDataPermissionsLink);
        fixture.detectChanges();

        const dialog = await within(document.body).findByRole('dialog');

        const dialogMessage = within(dialog).getByText('Set data permissions', { exact: false });
        const setPermissionsButton = within(dialog).getByText('Set Permissions');
        const cancelLink = within(dialog).getByText('Cancel');

        expect(dialog).toBeTruthy();
        expect(dialogMessage).toBeTruthy();
        expect(setPermissionsButton).toBeTruthy();
        expect(cancelLink).toBeTruthy();
      });
    });

    describe('remove parent association', () => {
      it('should not not show link if canRemoveParentAssociation is false', async () => {
        const { component, fixture, queryByText } = await setup();
        component.canRemoveParentAssociation = false;
        fixture.detectChanges();

        const removeLinkToParentLink = queryByText('Remove link to my parent organisation');

        expect(removeLinkToParentLink).toBeFalsy();
      });

      describe('canRemoveParentAssociation is true', () => {
        it('should show the link ', async () => {
          const { component, fixture, getByText } = await setup();
          component.canRemoveParentAssociation = true;
          fixture.detectChanges();

          const removeLinkToParentlink = getByText(`Remove the link to your parent workplace`);

          expect(removeLinkToParentlink).toBeTruthy();
        });

        it('should show OwnershipChangeMessageDialog if canRemoveParentAssociation is true', async () => {
          const { component, fixture, getByText } = await setup();
          component.canRemoveParentAssociation = true;
          component.isOwnershipRequested = true;
          fixture.detectChanges();

          const removeLinkToParentlink = getByText(`Remove the link to your parent workplace`);
          const dialogMessage = 'To remove the link to your parent organisation, you must own your data';

          fireEvent.click(removeLinkToParentlink);
          fixture.detectChanges();

          const dialog = await within(document.body).findByRole('dialog');

          expect(dialog).toBeTruthy();
          expect(within(dialog).getByText(dialogMessage, { exact: false })).toBeTruthy();
        });

        it('should show remove link to parent if data owner', async () => {
          const { component, fixture, getByText } = await setup();

          component.canRemoveParentAssociation = true;
          component.canViewChangeDataOwner = false;
          component.workplace.dataOwnershipRequested = null;
          fixture.detectChanges();

          const removeLinkToParentlink = getByText(`Remove the link to your parent workplace`);

          expect(removeLinkToParentlink).toBeTruthy();
          expect(removeLinkToParentlink.getAttribute('href')).toBe('/remove-link-to-parent');
        });
      });
    });
  });

  describe('cards', () => {
    describe('Benchmarks', () => {
      describe('Where main service is one of the big 3', async () => {
        const establishment = {
          ...Establishment,
          mainService: {
            ...Establishment.mainService,
            reportingID: 8,
          },
          isRegulated: true,
        };

        it('should show the benchmarks card text non pluralised if there is only one workplace in the comparison data', async () => {
          const { getByText } = await setup(false, establishment, true, 1);

          const benchmarksCardText = getByText('There is 1 workplace providing day care and day services in Test LA.');

          expect(benchmarksCardText).toBeTruthy();
        });

        it('without comparison data, should show a card with a link that takes you to the benchmarks tab', async () => {
          const { getByText, tabsServiceSpy } = await setup(false, establishment, false);

          const benchmarksLink = getByText('See how you compare against other workplaces');
          const benchmarksCardText = getByText(
            `Benchmarks can show how you're doing when it comes to pay, recruitment and retention.`,
          );
          fireEvent.click(benchmarksLink);

          expect(true).toBeTruthy();
          expect(benchmarksLink).toBeTruthy();
          expect(benchmarksCardText).toBeTruthy();
          expect(tabsServiceSpy).toHaveBeenCalledWith('benchmarks');
        });

        const testCases = [1, 2, 8];
        for (const serviceType of testCases) {
          const establishment = {
            ...Establishment,
            mainService: {
              ...Establishment.mainService,
              reportingID: serviceType,
            },
            isRegulated: true,
          };

          it('with comparison data, should show a card with a link that takes you to the benchmarks tab', async () => {
            const { getByText, tabsServiceSpy } = await setup(false, establishment);

            const benchmarksLink = getByText(
              'See how your pay, recruitment and retention compares against other workplaces',
            );
            const benchmarksCardText = getByText(
              'There are 9 workplaces providing day care and day services in Test LA.',
            );
            fireEvent.click(benchmarksLink);

            expect(benchmarksLink).toBeTruthy();
            expect(benchmarksCardText).toBeTruthy();
            expect(tabsServiceSpy).toHaveBeenCalledWith('benchmarks');
          });
        }
      });

      describe('Where establishment is not big 3', async () => {
        const establishment = {
          ...Establishment,
          mainService: {
            ...Establishment.mainService,
            reportingID: 5,
          },
        };

        it('should show a card with a link that takes you to the benchmarks tab', async () => {
          const { getByText, tabsServiceSpy } = await setup(false, establishment);

          const benchmarksLink = getByText('See how you compare against other workplaces');
          const benchmarksCardText = getByText('There are 9 workplaces providing adult social care in Test LA.');
          fireEvent.click(benchmarksLink);

          expect(benchmarksLink).toBeTruthy();
          expect(benchmarksCardText).toBeTruthy();
          expect(tabsServiceSpy).toHaveBeenCalledWith('benchmarks');
        });

        it('should show the benchmarks card text non pluralised if there is only one workplace in the comparison data', async () => {
          const { getByText } = await setup(false, establishment, true, 1);

          const benchmarksCardText = getByText('There is 1 workplace providing adult social care in Test LA.');

          expect(benchmarksCardText).toBeTruthy();
        });

        it('without comparison data, should show a card with a link that takes you to the benchmarks tab', async () => {
          const { getByText, tabsServiceSpy } = await setup(false, establishment, false);

          const benchmarksLink = getByText('See how you compare against other workplaces');
          const benchmarksCardText = getByText(
            `Benchmarks can show how you're doing when it comes to pay, recruitment and retention.`,
          );
          fireEvent.click(benchmarksLink);

          expect(benchmarksLink).toBeTruthy();
          expect(benchmarksCardText).toBeTruthy();
          expect(tabsServiceSpy).toHaveBeenCalledWith('benchmarks');
        });
      });
    });

    it('should show a card with a link that takes you to the benefits bundle page', async () => {
      const { getByText } = await setup();

      const benefitsBundleLink = getByText('View the ASC-WDS Benefits Bundle');

      expect(benefitsBundleLink).toBeTruthy();
      expect(benefitsBundleLink.getAttribute('href')).toBe('/benefits-bundle');
    });
  });

  describe('summary', () => {
    it('should show summary box', async () => {
      const { getByTestId } = await setup();

      const summaryBox = getByTestId('summaryBox');

      expect(summaryBox).toBeTruthy();
    });

    describe('workplace summary section', () => {
      it('should take you to the workplace tab when clicking the workplace link', async () => {
        const { getByText, tabsServiceSpy } = await setup();

        const workplaceLink = getByText('Workplace');
        fireEvent.click(workplaceLink);
        expect(tabsServiceSpy).toHaveBeenCalledWith('workplace');
      });

      it('should show a warning link which should navigate to the workplace tab', async () => {
        const establishment = { ...Establishment, showAddWorkplaceDetailsBanner: true };
        const { getByText, tabsServiceSpy } = await setup(true, establishment);

        const link = getByText('Add more details to your workplace');

        expect(link).toBeTruthy();
        fireEvent.click(link);
        expect(tabsServiceSpy).toHaveBeenCalledWith('workplace');
      });
    });

    describe('staff records summary section', () => {
      it('should show staff records link and take you to the staff records tab', async () => {
        const { getByText, tabsServiceSpy } = await setup();

        const staffRecordsLink = getByText('Staff records');
        fireEvent.click(staffRecordsLink);

        expect(tabsServiceSpy).toHaveBeenCalledWith('staff-records');
      });
    });

    describe('training and qualifications summary section', () => {
      it('should show training and qualifications link that take you the training and qualifications tab', async () => {
        const { getByText, tabsServiceSpy } = await setup();

        const trainingAndQualificationsLink = getByText('Training and qualifications');
        fireEvent.click(trainingAndQualificationsLink);

        expect(tabsServiceSpy).toHaveBeenCalledWith('training-and-qualifications');
      });
    });
  });

  describe('Pushing userType to dataLayer', () => {
    [Roles.Admin, Roles.AdminManager].forEach((adminRole) => {
      it(`should push admin when role is ${adminRole}`, async () => {
        const overrides = {
          userRole: adminRole,
        };

        const { dataLayerPushSpy } = await setup(false, Establishment, true, 9, overrides);

        expect(dataLayerPushSpy).toHaveBeenCalledWith({ userType: 'Admin' });
      });

      it(`should push admin when role is ${adminRole} even if isParent is true`, async () => {
        const overrides = {
          userRole: adminRole,
        };
        const establishment = { ...Establishment, isParent: true };

        const { dataLayerPushSpy } = await setup(false, establishment, true, 9, overrides);

        expect(dataLayerPushSpy).toHaveBeenCalledWith({ userType: 'Admin' });
      });

      it(`should push admin when role is ${adminRole} even if there is parentUid`, async () => {
        const overrides = {
          userRole: adminRole,
        };
        const establishment = { ...Establishment, parentUid: 'parent-uid' };

        const { dataLayerPushSpy } = await setup(false, establishment, true, 9, overrides);

        expect(dataLayerPushSpy).toHaveBeenCalledWith({ userType: 'Admin' });
      });
    });

    [Roles.Edit, Roles.Read].forEach((role) => {
      it(`should push 'Parent' when role is ${role} and isParent is true`, async () => {
        const overrides = {
          userRole: role,
        };
        const establishment = { ...Establishment, isParent: true };

        const { dataLayerPushSpy } = await setup(false, establishment, true, 9, overrides);

        expect(dataLayerPushSpy).toHaveBeenCalledWith({ userType: 'Parent' });
      });

      it(`should push 'Sub' when role is ${role} and there is parentUid`, async () => {
        const overrides = {
          userRole: role,
        };
        const establishment = { ...Establishment, parentUid: 'parent-uid' };

        const { dataLayerPushSpy } = await setup(false, establishment, true, 9, overrides);

        expect(dataLayerPushSpy).toHaveBeenCalledWith({ userType: 'Sub' });
      });

      it(`should push 'Standalone' when role is ${role} and there is no parentUid and isParent false`, async () => {
        const overrides = {
          userRole: role,
        };
        const establishment = { ...Establishment, parentUid: null, isParent: false };

        const { dataLayerPushSpy } = await setup(false, establishment, true, 9, overrides);

        expect(dataLayerPushSpy).toHaveBeenCalledWith({ userType: 'Standalone' });
      });
    });
  });
});
