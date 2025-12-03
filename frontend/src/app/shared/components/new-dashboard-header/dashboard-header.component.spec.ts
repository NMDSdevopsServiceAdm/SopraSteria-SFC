import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowToken } from '@core/services/window';
import { WindowRef } from '@core/services/window.ref';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockParentSubsidiaryViewService } from '@core/test-utils/MockParentSubsidiaryViewService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';

import { NewDashboardHeaderComponent } from './dashboard-header.component';

const MockWindow = {
  dataLayer: {
    push: () => {
      return;
    },
  },
};

describe('NewDashboardHeaderComponent', () => {
  const establishment = establishmentBuilder() as Establishment;
  const setup = async (
    override: any = {
      tab: 'home',
      updateDate: false,
      canAddWorker: true,
      canEditWorker: false,
      hasWorkers: true,
      isAdmin: true,
      subsidiaries: 0,
      viewingSubAsParent: false,
      canDeleteEstablishment: true,
    },
  ) => {
    const role = override.isAdmin ? Roles.Admin : Roles.Edit;
    const updatedDate = override.updateDate ? '01/02/2023' : null;
    const setupTools = await render(NewDashboardHeaderComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(
            override.canDeleteEstablishment ? ['canDeleteEstablishment'] : [],
            override.isAdmin,
          ),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(override.subsidiaries, role),
          deps: [HttpClient],
        },
        {
          provide: AuthService,
          useFactory: MockAuthService.factory(true, override.isAdmin),
          deps: [HttpClient, Router, EstablishmentService, UserService, PermissionsService],
        },
        { provide: WindowToken, useValue: MockWindow },
        {
          provide: ParentSubsidiaryViewService,
          useFactory: MockParentSubsidiaryViewService.factory(override.viewingSubAsParent),
        },
      ],
      componentProperties: {
        tab: override.tab,
        canAddWorker: override.canAddWorker,
        updatedDate,
        tAndQCount: 5,
        canEditWorker: override.canEditWorker,
        hasWorkers: override.hasWorkers,
        isParent: false,
        workplace: establishment,
        hasTrainingCourse: true,
      },
    });

    const component = setupTools.fixture.componentInstance;
    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      ...setupTools,
      establishmentService,
      router,
      routerSpy,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Home tab', () => {
    it('should show the workplace name and the nmdsId number but not an updated date', async () => {
      const { component, getByText, queryByTestId } = await setup();

      const workplace = component.workplace;

      expect(queryByTestId('workplaceName')).toBeTruthy();
      expect(getByText(`Workplace ID: ${workplace.nmdsId}`)).toBeTruthy();
      expect(queryByTestId('separator')).toBeFalsy();
      expect(queryByTestId('lastUpdatedDate')).toBeFalsy();
    });

    it('should not show parent above workplace name if it is not a parent', async () => {
      const { queryByTestId } = await setup();

      expect(queryByTestId('parentLabel')).toBeFalsy();
    });

    it('should show parent above workplace name if it is a parent', async () => {
      const { component, queryByTestId } = await setup();

      component.isParent = true;

      expect(queryByTestId('parentLabel')).toBeTruthy();
    });

    it('should show Skills for Care contact info', async () => {
      const { getByTestId } = await setup();

      expect(getByTestId('contact-info')).toBeTruthy();
    });

    it('should render conditional column width classes', async () => {
      const { getByTestId } = await setup();

      const column1 = getByTestId('column-one');
      const column2 = getByTestId('column-two');

      expect(column1.getAttribute('class')).toContain('govuk-grid-column-one-half');
      expect(column2.getAttribute('class')).toContain('govuk-grid-column-one-half');
    });

    it('should show the parent name for a sub account', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.isParent = false;
      component.workplace.parentName = 'My parent';

      fixture.detectChanges();

      const parentName = getByTestId('parentNameLabel');

      expect(parentName).toBeTruthy();
    });

    it('should show the selected workplace caption if a sub in parent view', async () => {
      const { component, fixture, getByTestId, queryByTestId } = await setup();

      component.isParent = false;
      component.isParentSubsidiaryView = true;

      fixture.detectChanges();

      const selectedWorkplaceLabel = getByTestId('selectedWorkplaceLabel');
      const parentName = queryByTestId('parentNameLabel');

      expect(selectedWorkplaceLabel).toBeTruthy();
      expect(parentName).toBeFalsy();
    });

    it('should not show the workplace address', async () => {
      const override = { tab: 'home' };
      const { queryByTestId } = await setup(override);

      expect(queryByTestId('workplace-address')).toBeFalsy();
    });
  });

  describe('Workplace tab', () => {
    it('should display the workplace name, the tab name, the nmdsId number and the last updated date', async () => {
      const override = {
        tab: 'workplace',
        updateDate: true,
      };
      const { component, getByText, getByTestId } = await setup(override);

      const workplace = component.workplace;

      expect(within(getByTestId('workplaceName')).getByText(workplace.name)).toBeTruthy();
      expect(getByText('Workplace')).toBeTruthy();
      expect(getByText(`Workplace ID: ${workplace.nmdsId}`)).toBeTruthy();
      expect(getByTestId('separator')).toBeTruthy();
      expect(getByTestId('lastUpdatedDate')).toBeTruthy();
    });

    it('should not display the contact info', async () => {
      const override = { tab: 'workplace' };
      const { queryByTestId } = await setup(override);

      expect(queryByTestId('contact-info')).toBeFalsy();
    });

    it('should render conditional column width classes', async () => {
      const override = { tab: 'workplace' };
      const { getByTestId } = await setup(override);

      const column1 = getByTestId('column-one');
      const column2 = getByTestId('column-two');

      expect(column1.getAttribute('class')).toContain('govuk-grid-column-two-thirds');
      expect(column2.getAttribute('class')).toContain('govuk-grid-column-one-third');
    });

    it('should show the workplace address', async () => {
      const override = { tab: 'workplace' };
      const { getByTestId } = await setup(override);

      expect(getByTestId('workplace-address')).toBeTruthy();
    });

    describe('what you can do as a parent link', async () => {
      it('should show if it is parent', async () => {
        const override = { tab: 'workplace' };
        const { component, fixture, getByTestId, getByText } = await setup(override);

        component.isParent = true;
        fixture.detectChanges();

        const doAsParentLink = getByTestId('do-as-parent');
        const doAsParentText = 'What you can do as a parent';

        expect(doAsParentLink).toBeTruthy();
        expect(within(doAsParentLink).getByText(doAsParentText)).toBeTruthy();
        expect(getByText(doAsParentText).getAttribute('href')).toEqual('/workplace/about-parents');
      });

      it('should not show if it is not parent', async () => {
        const override = { tab: 'workplace' };
        const { component, fixture, queryByTestId } = await setup(override);

        component.isParent = false;
        fixture.detectChanges();

        expect(queryByTestId('do-as-parent')).toBeFalsy();
      });
    });
  });

  describe('staff records tab', () => {
    it('should display the workplace name, the tab name, the nmdsId number and the last updated date', async () => {
      const override = {
        tab: 'staff-records',
        updateDate: true,
      };
      const { component, getByText, getByTestId } = await setup(override);

      const workplace = component.workplace;

      expect(getByText(workplace.name)).toBeTruthy();
      expect(getByText('Staff records')).toBeTruthy();
      expect(getByText(`Workplace ID: ${workplace.nmdsId}`)).toBeTruthy();
      expect(getByTestId('separator')).toBeTruthy();
      expect(getByTestId('lastUpdatedDate')).toBeTruthy();
    });

    it('should not display date if an updated date is not given', async () => {
      const override = {
        tab: 'staff-records',
        updateDate: false,
      };
      const { queryByTestId } = await setup(override);

      expect(queryByTestId('separator')).toBeFalsy();
      expect(queryByTestId('lastUpdatedDate')).toBeFalsy();
    });

    it('should not display the contact info', async () => {
      const override = {
        tab: 'staff-records',
      };
      const { queryByTestId } = await setup(override);

      expect(queryByTestId('contact-info')).toBeFalsy();
    });

    it('should display the add a staff record button if canAddWorker is true with correct href', async () => {
      const override = {
        tab: 'staff-records',
        canAddWorker: true,
      };
      const { component, getByText } = await setup(override);

      const workplaceUid = component.workplace.uid;
      const button = getByText('Add a staff record');

      expect(button).toBeTruthy();
      expect(button.getAttribute('href')).toEqual(`/workplace/${workplaceUid}/staff-record/create-staff-record`);
    });

    it('should not display the add a staff record button if canAddWorker is not true', async () => {
      const override = {
        tab: 'staff-records',
        updateDate: true,
        canAddWorker: false,
      };
      const { queryByText } = await setup(override);

      expect(queryByText('Add a staff record')).toBeFalsy();
    });

    it('should render conditional column width classes', async () => {
      const override = {
        tab: 'staff-records',
      };
      const { getByTestId } = await setup(override);

      const column1 = getByTestId('column-one');
      const column2 = getByTestId('column-two');

      expect(column1.getAttribute('class')).toContain('govuk-grid-column-two-thirds');
      expect(column2.getAttribute('class')).toContain('govuk-grid-column-one-third');
    });

    it('should not show the workplace address', async () => {
      const override = {
        tab: 'staff-records',
      };
      const { queryByTestId } = await setup(override);

      expect(queryByTestId('workplace-address')).toBeFalsy();
    });
  });

  describe('training and qualifications tab', () => {
    it('should display the workplace name, the tab name the number of t and qs, the nmdsId number and the last updated date', async () => {
      const override = {
        tab: 'training-and-qualifications',
        updateDate: true,
      };

      const { component, getByText, getByTestId } = await setup(override);

      const workplace = component.workplace;

      expect(getByText(workplace.name)).toBeTruthy();
      expect(getByText('Training and qualifications (5)')).toBeTruthy();
      expect(getByText(`Workplace ID: ${workplace.nmdsId}`)).toBeTruthy();
      expect(getByTestId('separator')).toBeTruthy();
      expect(getByTestId('lastUpdatedDate')).toBeTruthy();
    });

    it('should not display date if an updated date is not given', async () => {
      const override = {
        tab: 'training-and-qualifications',
        updateDate: false,
      };
      const { queryByTestId } = await setup(override);

      expect(queryByTestId('separator')).toBeFalsy();
      expect(queryByTestId('lastUpdatedDate')).toBeFalsy();
    });

    it('should not display the contact info', async () => {
      const override = {
        tab: 'training-and-qualifications',
      };
      const { queryByTestId } = await setup(override);

      expect(queryByTestId('contact-info')).toBeFalsy();
    });

    describe('"Add and manage training" button', () => {
      it('should be visible if canEditWorker is true', async () => {
        const override = {
          tab: 'training-and-qualifications',
          updateDate: false,
          canAddWorker: false,
          canEditWorker: true,
          hasWorkers: true,
        };

        const { getByText } = await setup(override);
        const button = getByText('Add and manage training');

        expect(button).toBeTruthy();
      });

      it('should not be visible if canEditWorker is not true', async () => {
        const override = {
          tab: 'training-and-qualifications',
        };
        const { queryByText } = await setup(override);

        expect(queryByText('Add and manage training')).toBeFalsy();
      });

      it('should not be visible if there are no workers', async () => {
        const override = {
          tab: 'training-and-qualifications',
          updateDate: false,
          canAddWorker: false,
          canEditWorker: true,
          hasWorkers: false,
        };
        const { queryByText } = await setup(override);

        expect(queryByText('Add and manage training')).toBeFalsy();
      });

      it('should not display the sub-menus initially', async () => {
        const override = {
          tab: 'training-and-qualifications',
          updateDate: false,
          canAddWorker: false,
          canEditWorker: true,
          hasWorkers: true,
        };

        const { fixture } = await setup(override);
        const subMenus: HTMLElement = fixture.nativeElement.querySelector('.asc-button-menu__wrapper');

        expect(subMenus.hidden).toBeTruthy();
      });

      it('should display the sub-menus when the button is clicked', async () => {
        const override = {
          tab: 'training-and-qualifications',
          updateDate: false,
          canAddWorker: false,
          canEditWorker: true,
          hasWorkers: true,
        };

        const { fixture, getByText } = await setup(override);
        const subMenus: HTMLElement = fixture.nativeElement.querySelector('.asc-button-menu__wrapper');
        const button = getByText('Add and manage training');

        button.click();
        fixture.detectChanges();

        expect(subMenus.hidden).toBeFalsy();
      });

      it('should display the correct sub-menu links', async () => {
        const override = {
          tab: 'training-and-qualifications',
          updateDate: false,
          canAddWorker: false,
          canEditWorker: true,
          hasWorkers: true,
        };

        const { component, fixture, getByText } = await setup(override);
        const button = getByText('Add and manage training');

        button.click();
        fixture.detectChanges();

        const workplaceUid = component.workplace.uid;

        const addMultipleTrainingRecordsSubMenu = getByText('Add multiple training records');
        expect(addMultipleTrainingRecordsSubMenu).toBeTruthy();
        expect(addMultipleTrainingRecordsSubMenu.getAttribute('href')).toEqual(
          `/workplace/${workplaceUid}/add-multiple-training/select-staff`,
        );

        const addAndManageTrainingCoursesSubMenu = getByText('Add and manage training courses');
        expect(addAndManageTrainingCoursesSubMenu).toBeTruthy();
        expect(addAndManageTrainingCoursesSubMenu.getAttribute('href')).toEqual(
          `/workplace/${workplaceUid}/training-course/add-and-manage-training-courses`,
        );

        const updateRecordsWithTrainingCourseDetailsSubMenu = getByText('Update records with training course details');
        expect(updateRecordsWithTrainingCourseDetailsSubMenu).toBeTruthy();
        expect(updateRecordsWithTrainingCourseDetailsSubMenu.getAttribute('href')).toEqual(
          `/workplace/${workplaceUid}/update-records-with-training-course-details/select-a-training-course`,
        );

        const addAMandatoryTrainingCategorySubMenu = getByText('Add a mandatory training category');
        expect(addAMandatoryTrainingCategorySubMenu).toBeTruthy();
        expect(addAMandatoryTrainingCategorySubMenu.getAttribute('href')).toEqual(
          `/workplace/${workplaceUid}/add-and-manage-mandatory-training`,
        );

        const manageExpiryAlertsSubMenu = getByText('Manage expiry alerts');
        expect(manageExpiryAlertsSubMenu).toBeTruthy();
        expect(manageExpiryAlertsSubMenu.getAttribute('href')).toEqual(
          `/workplace/${workplaceUid}/change-expires-soon-alerts`,
        );
      });

      it('should not  display the `Update records with training course details` in the sub-menu links', async () => {
        const override = {
          tab: 'training-and-qualifications',
          updateDate: false,
          canAddWorker: false,
          canEditWorker: true,
          hasWorkers: true,
        };

        const { component, fixture, getByText, queryByText } = await setup(override);
        const button = getByText('Add and manage training');

        component.hasTrainingCourse = false;

        button.click();
        fixture.detectChanges();

        const addAndManageTrainingCourseDetailsSubMenu = queryByText('Update records with training course details');
        expect(addAndManageTrainingCourseDetailsSubMenu).toBeNull();
      });
    });

    it('should render conditional column width classes', async () => {
      const override = {
        tab: 'training-and-qualifications',
      };
      const { getByTestId } = await setup(override);

      const column1 = getByTestId('column-one');
      const column2 = getByTestId('column-two');

      expect(column1.getAttribute('class')).toContain('govuk-grid-column-two-thirds');
      expect(column2.getAttribute('class')).toContain('govuk-grid-column-one-third');
    });

    it('should not show the workplace address', async () => {
      const override = {
        tab: 'training-and-qualifications',
      };
      const { queryByTestId } = await setup(override);

      expect(queryByTestId('workplace-address')).toBeFalsy();
    });
  });

  describe('Benchmarks tab', () => {
    it('should display the workplace name, the tab name and the nmdsId number', async () => {
      const override = {
        tab: 'benchmarks',
      };
      const { component, getByText } = await setup(override);
      const workplace = component.workplace;
      expect(getByText(workplace.name)).toBeTruthy();
      expect(getByText('Benchmarks')).toBeTruthy();
      expect(getByText(`Workplace ID: ${workplace.nmdsId}`)).toBeTruthy();
    });

    it('should not display date if an updated date is not given', async () => {
      const override = {
        tab: 'benchmarks',
        updateDate: false,
      };
      const { queryByTestId } = await setup(override);
      expect(queryByTestId('separator')).toBeFalsy();
      expect(queryByTestId('lastUpdatedDate')).toBeFalsy();
    });

    it('should not display the contact info', async () => {
      const override = {
        tab: 'benchmarks',
      };
      const { queryByTestId } = await setup(override);
      expect(queryByTestId('contact-info')).toBeFalsy();
    });

    it('should render conditional column width classes', async () => {
      const override = {
        tab: 'benchmarks',
      };
      const { getByTestId } = await setup(override);
      const column1 = getByTestId('column-one');
      const column2 = getByTestId('column-two');
      expect(column1.getAttribute('class')).toContain('govuk-grid-column-two-thirds');
      expect(column2.getAttribute('class')).toContain('govuk-grid-column-one-third');
    });

    it('should not show the workplace address', async () => {
      const override = {
        tab: 'benchmarks',
      };
      const { queryByTestId } = await setup(override);
      expect(queryByTestId('workplace-address')).toBeFalsy();
    });
  });

  describe('Archive Workplace', () => {
    it('should display a Delete workplace link if user is an admin', async () => {
      const { getByText } = await setup();

      expect(getByText('Delete workplace')).toBeTruthy();
    });

    it('should display a Delete workplace link if parent is viewing a subsidiary', async () => {
      const override = {
        tab: 'home',
        updateDate: false,
        canAddWorker: true,
        canEditWorker: false,
        hasWorkers: false,
        isAdmin: false,
        subsidiaries: 1,
        viewingSubAsParent: true,
        canDeleteEstablishment: true,
      };
      const { getByText } = await setup(override);

      expect(getByText('Delete workplace')).toBeTruthy();
    });

    it('should not display a Delete workplace link if the workplace has subsidiaries', async () => {
      const override = {
        tab: 'home',
        updateDate: false,
        canAddWorker: true,
        canEditWorker: false,
        hasWorkers: true,
        isAdmin: false,
        subsidiaries: 2,
        viewingSubAsParent: false,
        canDeleteEstablishment: true,
      };

      const { queryByText } = await setup(override);

      expect(queryByText('Delete workplace')).toBeNull();
    });

    it('should not display a Delete workplace link if user not an admin and does not have canDeleteEstablishment permission', async () => {
      const override = {
        tab: 'home',
        updateDate: false,
        canAddWorker: true,
        canEditWorker: false,
        hasWorkers: true,
        isAdmin: false,
        subsidiaries: 0,
        viewingSubAsParent: true,
        canDeleteEstablishment: false,
      };
      const { queryByText } = await setup(override);

      expect(queryByText('Delete workplace')).toBeNull();
    });

    it('should navigate to the subsidiary delete-workplace page when parent is viewing a subsidiary', async () => {
      const override = {
        tab: 'home',
        updateDate: false,
        canAddWorker: true,
        canEditWorker: false,
        hasWorkers: false,
        isAdmin: false,
        subsidiaries: 1,
        viewingSubAsParent: true,
        canDeleteEstablishment: true,
      };
      const { getByText, routerSpy, component } = await setup(override);

      const deletWorplaceLink = getByText('Delete workplace');
      deletWorplaceLink.click();

      expect(routerSpy).toHaveBeenCalledWith([component.workplace.uid, 'delete-workplace']);
    });

    it('should navigate to the standalone delete-workplace page when logged in as admin', async () => {
      const override = {
        tab: 'home',
        updateDate: false,
        canAddWorker: true,
        canEditWorker: false,
        hasWorkers: false,
        isAdmin: true,
        subsidiaries: 0,
        viewingSubAsParent: false,
        canDeleteEstablishment: true,
      };
      const { getByText, routerSpy } = await setup(override);

      const deletWorplaceLink = getByText('Delete workplace');
      deletWorplaceLink.click();

      expect(routerSpy).toHaveBeenCalledWith(['/delete-workplace']);
    });
  });
});
