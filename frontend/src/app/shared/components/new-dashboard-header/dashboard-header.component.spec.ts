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
import { of } from 'rxjs';

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
    tab = 'home',
    updateDate = false,
    canAddWorker = true,
    canEditWorker = false,
    hasWorkers = true,
    isAdmin = true,
    subsidiaries = 0,
    viewingSubAsParent = false,
    canDeleteEstablishment = true,
    workplace = establishment,
  ) => {
    const role = isAdmin ? Roles.Admin : Roles.Edit;
    const updatedDate = updateDate ? '01/02/2023' : null;
    const { fixture, getByTestId, queryByTestId, getByText, queryByText } = await render(NewDashboardHeaderComponent, {
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
          useFactory: MockPermissionsService.factory(canDeleteEstablishment ? ['canDeleteEstablishment'] : [], isAdmin),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(subsidiaries, role),
          deps: [HttpClient],
        },
        {
          provide: AuthService,
          useFactory: MockAuthService.factory(true, isAdmin),
          deps: [HttpClient, Router, EstablishmentService, UserService, PermissionsService],
        },
        { provide: WindowToken, useValue: MockWindow },
        {
          provide: ParentSubsidiaryViewService,
          useFactory: MockParentSubsidiaryViewService.factory(viewingSubAsParent),
        },
      ],
      componentProperties: {
        tab,
        canAddWorker,
        updatedDate,
        tAndQCount: 5,
        canEditWorker,
        hasWorkers,
        isParent: false,
        workplace,
      },
    });

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      getByTestId,
      queryByTestId,
      getByText,
      queryByText,
      establishmentService,
      router,
      fixture,
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
      const { component, queryByTestId } = await setup();

      component.isParent = false;

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
  });

  describe('Workplace tab', () => {
    it('should display the workplace name, the tab name, the nmdsId number and the last updated date', async () => {
      const { component, getByText, getByTestId } = await setup('workplace', true);

      const workplace = component.workplace;

      expect(getByText(workplace.name)).toBeTruthy();
      expect(getByText('Workplace')).toBeTruthy();
      expect(getByText(`Workplace ID: ${workplace.nmdsId}`)).toBeTruthy();
      expect(getByTestId('separator')).toBeTruthy();
      expect(getByTestId('lastUpdatedDate')).toBeTruthy();
    });

    it('should not display the contact info', async () => {
      const { queryByTestId } = await setup('workplace');

      expect(queryByTestId('contact-info')).toBeFalsy();
    });

    it('should render conditional column width classes', async () => {
      const { getByTestId } = await setup('workplace');

      const column1 = getByTestId('column-one');
      const column2 = getByTestId('column-two');

      expect(column1.getAttribute('class')).toContain('govuk-grid-column-two-thirds');
      expect(column2.getAttribute('class')).toContain('govuk-grid-column-one-third');
    });
  });

  describe('staff records tab', () => {
    it('should display the workplace name, the tab name, the nmdsId number and the last updated date', async () => {
      const { component, getByText, getByTestId } = await setup('staff-records', true);

      const workplace = component.workplace;

      expect(getByText(workplace.name)).toBeTruthy();
      expect(getByText('Staff records')).toBeTruthy();
      expect(getByText(`Workplace ID: ${workplace.nmdsId}`)).toBeTruthy();
      expect(getByTestId('separator')).toBeTruthy();
      expect(getByTestId('lastUpdatedDate')).toBeTruthy();
    });

    it('should not display date if an updated date is not given', async () => {
      const { queryByTestId } = await setup('staff-records', false);

      expect(queryByTestId('separator')).toBeFalsy();
      expect(queryByTestId('lastUpdatedDate')).toBeFalsy();
    });

    it('should not display the contact info', async () => {
      const { queryByTestId } = await setup('staff-records');

      expect(queryByTestId('contact-info')).toBeFalsy();
    });

    it('should display the add a staff record button if canAddWorker is true with correct href', async () => {
      const { component, getByText } = await setup('staff-records');

      const workplaceUid = component.workplace.uid;
      const button = getByText('Add a staff record');

      expect(button).toBeTruthy();
      expect(button.getAttribute('href')).toEqual(`/workplace/${workplaceUid}/staff-record/create-staff-record`);
    });

    it('should not display the add a staff record button if canAddWorker is not true', async () => {
      const { queryByText } = await setup('staff-records', true, false);

      expect(queryByText('Add a staff record')).toBeFalsy();
    });

    it('should render conditional column width classes', async () => {
      const { getByTestId } = await setup('staff-records');

      const column1 = getByTestId('column-one');
      const column2 = getByTestId('column-two');

      expect(column1.getAttribute('class')).toContain('govuk-grid-column-two-thirds');
      expect(column2.getAttribute('class')).toContain('govuk-grid-column-one-third');
    });
  });

  describe('training and qualifications tab', () => {
    it('should display the workplace name, the tab name the number of t and qs, the nmdsId number and the last updated date', async () => {
      const { component, getByText, getByTestId } = await setup('training-and-qualifications', true);

      const workplace = component.workplace;

      expect(getByText(workplace.name)).toBeTruthy();
      expect(getByText('Training and qualifications (5)')).toBeTruthy();
      expect(getByText(`Workplace ID: ${workplace.nmdsId}`)).toBeTruthy();
      expect(getByTestId('separator')).toBeTruthy();
      expect(getByTestId('lastUpdatedDate')).toBeTruthy();
    });

    it('should not display date if an updated date is not given', async () => {
      const { queryByTestId } = await setup('training-and-qualifications', false);

      expect(queryByTestId('separator')).toBeFalsy();
      expect(queryByTestId('lastUpdatedDate')).toBeFalsy();
    });

    it('should not display the contact info', async () => {
      const { queryByTestId } = await setup('training-and-qualifications');

      expect(queryByTestId('contact-info')).toBeFalsy();
    });

    it('should display the add multiple staff records button if canEditWorker is true with correct href', async () => {
      const { component, getByText } = await setup('training-and-qualifications', false, false, true);

      const workplaceUid = component.workplace.uid;
      const button = getByText('Add multiple training records');

      expect(button).toBeTruthy();
      expect(button.getAttribute('href')).toEqual(`/workplace/${workplaceUid}/add-multiple-training/select-staff`);
    });

    it('should not display the add multiple staff records button if canEditWorker is not true', async () => {
      const { queryByText } = await setup('training-and-qualifications');

      expect(queryByText('Add multiple training records')).toBeFalsy();
    });

    it('should not display the add multiple staff records button if there are no workers', async () => {
      const { queryByText } = await setup('training-and-qualifications', false, false, true, false);

      expect(queryByText('Add multiple training records')).toBeFalsy();
    });

    it('should render conditional column width classes', async () => {
      const { getByTestId } = await setup('staff-records');

      const column1 = getByTestId('column-one');
      const column2 = getByTestId('column-two');

      expect(column1.getAttribute('class')).toContain('govuk-grid-column-two-thirds');
      expect(column2.getAttribute('class')).toContain('govuk-grid-column-one-third');
    });
  });

  describe('Benchmarks tab', () => {
    it('should display the workplace name, the tab name and the nmdsId number', async () => {
      const { component, getByText } = await setup('benchmarks');

      const workplace = component.workplace;

      expect(getByText(workplace.name)).toBeTruthy();
      expect(getByText('Benchmarks')).toBeTruthy();
      expect(getByText(`Workplace ID: ${workplace.nmdsId}`)).toBeTruthy();
    });

    it('should not display date if an updated date is not given', async () => {
      const { queryByTestId } = await setup('benchmarks', false);

      expect(queryByTestId('separator')).toBeFalsy();
      expect(queryByTestId('lastUpdatedDate')).toBeFalsy();
    });

    it('should not display the contact info', async () => {
      const { queryByTestId } = await setup('benchmarks');

      expect(queryByTestId('contact-info')).toBeFalsy();
    });

    it('should render conditional column width classes', async () => {
      const { getByTestId } = await setup('benchmarks');

      const column1 = getByTestId('column-one');
      const column2 = getByTestId('column-two');

      expect(column1.getAttribute('class')).toContain('govuk-grid-column-two-thirds');
      expect(column2.getAttribute('class')).toContain('govuk-grid-column-one-third');
    });
  });

  describe('Archive Workplace', () => {
    it('should display a Delete workplace link if user is an admin', async () => {
      const { getByText } = await setup();

      expect(getByText('Delete workplace')).toBeTruthy();
    });

    it('should display a Delete workplace link if parent is viewing a subsidiary', async () => {
      const { getByText } = await setup('home', false, true, false, false, false, 1, true);

      expect(getByText('Delete workplace')).toBeTruthy();
    });

    it('should not display a Delete workplace link if the workplace has subsidiaries', async () => {
      const { queryByText } = await setup('home', false, true, false, true, false, 2);

      expect(queryByText('Delete workplace')).toBeNull();
    });

    it('should not display a Delete workplace link if user not an admin and does not have canDeleteEstablishment permission', async () => {
      const { queryByText } = await setup('home', false, true, false, true, false, 0, true, false);

      expect(queryByText('Delete workplace')).toBeNull();
    });

    it('should navigate to the subsidiary delete-workplace page when parent is viewing a subsidiary', async () => {
      const { getByText, routerSpy, component } = await setup('home', false, true, false, false, false, 1, true);

      const deletWorplaceLink = getByText('Delete workplace');
      deletWorplaceLink.click();

      expect(routerSpy).toHaveBeenCalledWith([component.workplace.uid, 'delete-workplace']);
    });

    it('should navigate to the standalone delete-workplace page when logged in as admin', async () => {
      const { getByText, routerSpy } = await setup('home', false, true, false, false, true, 0, false);

      const deletWorplaceLink = getByText('Delete workplace');
      deletWorplaceLink.click();

      expect(routerSpy).toHaveBeenCalledWith(['/delete-workplace']);
    });
  });
});
