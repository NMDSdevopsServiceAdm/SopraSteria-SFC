import { provideHttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { MainDashboardTabs, Tab, TabsService } from '@core/services/tabs.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockParentSubsidiaryViewService } from '@core/test-utils/MockParentSubsidiaryViewService';
import { MockRouter, setUpRouterState } from '@core/test-utils/MockRouter';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { BehaviorSubject } from 'rxjs';

import { NewTabsComponent } from './new-tabs.component';

describe('NewTabsComponent', () => {
  const allTabs: Tab[] = Object.values(MainDashboardTabs);

  const setup = async (overrides: any = {}) => {
    const { fixture, getByTestId } = await render(NewTabsComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        TabsService,
        {
          provide: ParentSubsidiaryViewService,
          useFactory: MockParentSubsidiaryViewService.factory(overrides.viewingSubAsParent ?? false),
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({}),
        },
      provideHttpClient(), provideHttpClientTesting(),],
      declarations: [],
      componentProperties: {
        tabs: allTabs,
        dashboardView: overrides.dashboardView ?? true,
      },
    });

    const component = fixture.componentInstance;
    const selectTabSpy = spyOn(component, 'selectTab').and.callThrough();
    const keyUpSpy = spyOn(component, 'onKeyUp').and.callThrough();
    const keyDownSpy = spyOn(component, 'onKeyDown').and.callThrough();

    const injector = getTestBed();
    const tabsService = injector.inject(TabsService);

    const router = injector.inject(Router);
    const routerSpy = spyOn(router, 'navigate');

    const url = overrides.url ?? '/dashboard';
    setUpRouterState(url, router);

    const location = injector.inject(Location);
    const locationSpy = spyOn(location, 'replaceState');

    const parentSubsidiaryViewService = injector.inject(ParentSubsidiaryViewService);

    return {
      component,
      fixture,
      getByTestId,
      selectTabSpy,
      keyUpSpy,
      keyDownSpy,
      tabsService,
      router,
      routerSpy,
      locationSpy,
      parentSubsidiaryViewService,
    };
  };

  const getAllActiveTabs = (): string[] => {
    return allTabs
      .map((tab) => tab.slug)
      .filter((tabSlug) => {
        const tabElement = screen.getByTestId(`tab_${tabSlug}`);
        const tabIsActive = tabElement.getAttribute('class').includes('asc-tab--active');
        return tabIsActive;
      });
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the tabs', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('tab_home')).toBeTruthy();
    expect(getByTestId('tab_workplace')).toBeTruthy();
    expect(getByTestId('tab_staff-records')).toBeTruthy();
    expect(getByTestId('tab_training-and-qualifications')).toBeTruthy();
    expect(getByTestId('tab_benchmarks')).toBeTruthy();
  });

  describe('selecting tabs', () => {
    it('should show active state on tab that is selected', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.ngOnInit();
      const workplaceTab = getByTestId('tab_workplace');

      fireEvent.click(workplaceTab);
      fixture.detectChanges();

      const activeTabs = getAllActiveTabs();
      expect(activeTabs).toEqual(['workplace']);
    });

    it('should call selectTab, set the selected tab property in the tabs service and emit the tab selected when a tab is clicked', async () => {
      const { component, fixture, getByTestId, selectTabSpy, tabsService } = await setup();

      const setSelectedTabSpy = spyOnProperty(tabsService, 'selectedTab', 'set');

      const emitSpy = spyOn(component.selectedTabClick, 'emit');
      const staffRecordsTab = getByTestId('tab_staff-records');

      fireEvent.click(staffRecordsTab);
      fixture.detectChanges();

      expect(selectTabSpy).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith({ tabSlug: 'staff-records' });
      expect(setSelectedTabSpy).toHaveBeenCalledWith('staff-records');
    });

    it('should navigate to the correct tab when a tab is clicked from another tab', async () => {
      const { fixture, getByTestId, locationSpy, routerSpy } = await setup();

      const tAndQTab = getByTestId('tab_training-and-qualifications');

      fireEvent.click(tAndQTab);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(locationSpy).toHaveBeenCalledWith('/dashboard#training-and-qualifications');
      expect(routerSpy).not.toHaveBeenCalled();
    });

    it('should navigate to the correct tab when a tab is clicked from a different page', async () => {
      const { fixture, getByTestId, locationSpy, routerSpy } = await setup({ dashboardView: false });

      const tAndQTab = getByTestId('tab_training-and-qualifications');

      fireEvent.click(tAndQTab);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'training-and-qualifications' });
      expect(locationSpy).not.toHaveBeenCalled();
    });

    it('should navigate to the sub tab url when tab clicked in sub view', async () => {
      const { getByTestId, parentSubsidiaryViewService, routerSpy } = await setup({ viewingSubAsParent: true });
      const subUid = 'abcde123';

      spyOn(parentSubsidiaryViewService, 'getSubsidiaryUid').and.returnValue(subUid);

      const tAndQTab = getByTestId('tab_training-and-qualifications');
      fireEvent.click(tAndQTab);

      expect(routerSpy).toHaveBeenCalledWith([`/subsidiary/${subUid}/training-and-qualifications`]);
    });
  });

  describe('when navigating to a page under another section', () => {
    const mockUid1 = 'c9a65ed6-db19-4add-94cb-af200036653c';
    const mockUid2 = 'ba50476b-7f3b-4bab-a36b-6bfcb3c37d62';

    describe('in standAloneAccount', () => {
      const testCases = [
        {
          mockUrl: `/workplace/${mockUid1}/training-and-qualifications-record/${mockUid2}/training`,
          expectedActiveTab: 'training-and-qualifications',
        },
        {
          mockUrl: `/workplace/${mockUid1}/training-and-qualifications-record/${mockUid2}/training#all-records`,
          expectedActiveTab: 'training-and-qualifications',
        },
        {
          mockUrl: `/workplace/${mockUid1}/staff-record/${mockUid2}/staff-record-summary`,
          expectedActiveTab: 'staff-records',
        },
        {
          mockUrl: `/workplace/${mockUid1}/training-and-qualifications/missing-mandatory-training`,
          expectedActiveTab: 'training-and-qualifications',
        },
        {
          mockUrl: `/workplace/${mockUid1}/care-workforce-pathway-awareness`,
          expectedActiveTab: 'workplace',
        },
      ];

      testCases.forEach(({ mockUrl, expectedActiveTab }) => {
        it(`should update active tab to ${expectedActiveTab}`, async () => {
          const { component, fixture, router, routerSpy } = await setup(false);
          const navigateEvent = new NavigationEnd(0, mockUrl, mockUrl);
          (router.events as BehaviorSubject<any>).next(navigateEvent);
          fixture.detectChanges();

          const activeTabs = getAllActiveTabs();
          expect(activeTabs).toEqual([expectedActiveTab]);
          expect(component.tabsService.selectedTab).toEqual(expectedActiveTab);

          expect(routerSpy).not.toHaveBeenCalled();
        });
      });
    });

    describe('in subsidiaryAccount', () => {
      const testCases = [
        {
          mockUrl: `/subsidiary/workplace/${mockUid1}/training-and-qualifications-record/${mockUid2}/training`,
          expectedActiveTab: 'training-and-qualifications',
        },
        {
          mockUrl: `/subsidiary/workplace/${mockUid1}/training-and-qualifications-record/${mockUid2}/training#all-records`,
          expectedActiveTab: 'training-and-qualifications',
        },
        {
          mockUrl: `/subsidiary/workplace/${mockUid1}/staff-record/${mockUid2}/staff-record-summary`,
          expectedActiveTab: 'staff-records',
        },
        {
          mockUrl: `/subsidiary/workplace/${mockUid1}/training-and-qualifications/missing-mandatory-training`,
          expectedActiveTab: 'training-and-qualifications',
        },
        {
          mockUrl: `/subsidiary/workplace/${mockUid1}/care-workforce-pathway-awareness`,
          expectedActiveTab: 'workplace',
        },
      ];

      testCases.forEach(({ mockUrl, expectedActiveTab }) => {
        it(`should update active tab to ${expectedActiveTab}`, async () => {
          const { component, fixture, router, routerSpy } = await setup();
          const navigateEvent = new NavigationEnd(0, mockUrl, mockUrl);
          (router.events as BehaviorSubject<any>).next(navigateEvent);
          fixture.detectChanges();

          const activeTabs = getAllActiveTabs();
          expect(activeTabs).toEqual([expectedActiveTab]);
          expect(component.tabsService.selectedTab).toEqual(expectedActiveTab);

          expect(routerSpy).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('onKeyUp', () => {
    it('should call onKeyUp and select tab when the left arrow keyboard key is clicked', async () => {
      const { fixture, getByTestId, keyUpSpy, selectTabSpy } = await setup();

      const homeTab = getByTestId('tab_home');
      fireEvent.click(homeTab);
      userEvent.type(homeTab, '{arrowleft}');
      fixture.detectChanges();

      expect(keyUpSpy).toHaveBeenCalled();
      expect(selectTabSpy).toHaveBeenCalledWith(new KeyboardEvent('ArrowLeft'), 4);
    });

    it('should call onKeyUp and select tab when the right arrow keyboard key is clicked', async () => {
      const { fixture, getByTestId, keyUpSpy, selectTabSpy } = await setup();

      const homeTab = getByTestId('tab_home');
      fireEvent.click(homeTab);
      userEvent.type(homeTab, '{arrowright}');
      fixture.detectChanges();

      expect(keyUpSpy).toHaveBeenCalled();
      expect(selectTabSpy).toHaveBeenCalledWith(new KeyboardEvent('ArrowRight'), 1);
    });
  });

  describe('onKeyDown', () => {
    it('should call onKeyDown and select tab when the Home keyboard key is clicked', async () => {
      const { fixture, getByTestId, keyUpSpy, selectTabSpy } = await setup();

      const tAndQTab = getByTestId('tab_training-and-qualifications');
      fireEvent.click(tAndQTab);
      userEvent.type(tAndQTab, '{home}');
      fixture.detectChanges();

      expect(keyUpSpy).toHaveBeenCalled();
      expect(selectTabSpy).toHaveBeenCalledWith(new KeyboardEvent('ArrowLeft'), 0);
    });

    it('should call onKeyDown and select tab when the Home keyboard key is clicked', async () => {
      const { fixture, getByTestId, keyDownSpy, selectTabSpy } = await setup();

      const homeTab = getByTestId('tab_home');
      fireEvent.click(homeTab);
      userEvent.type(homeTab, '{end}');
      fixture.detectChanges();

      expect(keyDownSpy).toHaveBeenCalled();
      expect(selectTabSpy).toHaveBeenCalledWith(new KeyboardEvent('End'), 4);
    });
  });

  describe('getTabSlugInSubView', () => {
    it('should return null when fewer than 3 segments in url path', async () => {
      const { component } = await setup({ url: '/dashboard' });
      const returned = component.getTabSlugInSubView();
      expect(returned).toEqual(null);
    });

    it('should return null when more than 3 segments in url path', async () => {
      const url = '/subsidiary/workplace/testuid/staff-record';

      const { component } = await setup({ url });
      const returned = component.getTabSlugInSubView();
      expect(returned).toEqual(null);
    });

    it('should return null when 3 segments but second segment does not match tab slug name', async () => {
      const url = '/subsidiary/articles/news-article';

      const { component } = await setup({ url });
      const returned = component.getTabSlugInSubView();
      expect(returned).toEqual(null);
    });

    it('should return tab slug when 3 segments and second segment matches tab slug', async () => {
      const url = '/subsidiary/testuid/training-and-qualifications';

      const { component } = await setup({ url });

      const returned = component.getTabSlugInSubView();
      expect(returned).toEqual('training-and-qualifications');
    });
  });

  describe('getTabSlugFromSubsidiaryUrl', async () => {
    it(`should return correct tab slug when third section of url is the tab slug`, async () => {
      const { component } = await setup();
      component.tabs.forEach((tab) => {
        const url = `/subsidiary/test-uid/${tab.slug}`;
        const result = component.getTabSlugFromSubsidiaryUrl(new NavigationEnd(0, url, url));

        expect(result).toEqual(tab.slug);
      });
    });

    it('should return nothing when no tab slug in the navigation event url', async () => {
      const { component } = await setup();

      const result = component.getTabSlugFromSubsidiaryUrl(new NavigationEnd(0, 'test-url.com', 'test-url.com'));

      expect(result).toBeFalsy();
    });

    it('should return nothing when workplace in url but in wrong section', async () => {
      const { component } = await setup();
      const url = '/subsidiary/workplace/test-uid/main-service-cqc';
      const result = component.getTabSlugFromSubsidiaryUrl(new NavigationEnd(0, url, url));

      expect(result).toBeFalsy();
    });

    it('should return nothing when url has fewer than 3 sections', async () => {
      const { component } = await setup();
      const url = '/subsidiary/benefits-bundle';
      const result = component.getTabSlugFromSubsidiaryUrl(new NavigationEnd(0, url, url));

      expect(result).toBeFalsy();
    });
  });

  describe('getTabSlugFromMainDashboardUrl', async () => {
    it(`should return tab slug when slug is in list of tabs`, async () => {
      const { component } = await setup();
      component.tabs.forEach((tab) => {
        const url = `/dashboard#${tab.slug}`;
        const result = component.getTabSlugFromMainDashboardUrl(new NavigationEnd(0, url, url));

        expect(result).toEqual(tab.slug);
      });
    });

    it('should return nothing when unexpected tab slug in the navigation event url', async () => {
      const { component } = await setup();

      const url = `/dashboard#invalidSlug`;
      const result = component.getTabSlugFromMainDashboardUrl(new NavigationEnd(0, url, url));

      expect(result).toBeFalsy();
    });

    it('should return nothing when main url is not dashboard', async () => {
      const { component } = await setup();

      const url = `/invalidUrl#home`;
      const result = component.getTabSlugFromMainDashboardUrl(new NavigationEnd(0, url, url));

      expect(result).toBeFalsy();
    });
  });

  describe('selectTab', () => {
    it('should navigate when in sub view and isOnPageLoad is passed in as false', async () => {
      const { component, routerSpy, parentSubsidiaryViewService } = await setup({ viewingSubAsParent: true });

      const index = 1;
      const subUid = 'abcde123';
      spyOn(parentSubsidiaryViewService, 'getSubsidiaryUid').and.returnValue(subUid);

      component.selectTab(new Event(null), index, true, true, false);

      expect(routerSpy).toHaveBeenCalledWith([`/subsidiary/${subUid}/${component.tabs[index].slug}`]);
    });

    it('should not navigate when isOnPageLoad is passed in as true in sub view', async () => {
      const { component, routerSpy, parentSubsidiaryViewService } = await setup({ viewingSubAsParent: true });

      const index = 1;
      const subUid = 'abcde123';
      spyOn(parentSubsidiaryViewService, 'getSubsidiaryUid').and.returnValue(subUid);

      component.selectTab(new Event(null), index, true, true, true);

      expect(routerSpy).not.toHaveBeenCalled();
    });

    it('should not navigate when isOnPageLoad is passed in as false but not in sub view', async () => {
      const { component, routerSpy, parentSubsidiaryViewService } = await setup();

      const index = 1;
      const subUid = 'abcde123';
      spyOn(parentSubsidiaryViewService, 'getSubsidiaryUid').and.returnValue(subUid);

      component.selectTab(new Event(null), index, true, true, false);

      expect(routerSpy).not.toHaveBeenCalled();
    });
  });

  describe('Styling of tabs', () => {
    it('should only add govuk-standalone-tabs__list-item class to tabs when in not in sub view', async () => {
      const { fixture } = await setup();

      const listElementsWithSubClass = fixture.nativeElement.querySelector('.govuk-subsidiary-tabs__list-item');
      expect(listElementsWithSubClass).toBeFalsy();

      const listElementsWithStandaloneClass = fixture.nativeElement.querySelector('.govuk-standalone-tabs__list-item');
      expect(listElementsWithStandaloneClass).toBeTruthy();
    });

    it('should only add govuk-subsidiary-tabs__list-item class to tabs when in sub view', async () => {
      const { fixture } = await setup({ viewingSubAsParent: true });

      const listElementsWithStandaloneClass = fixture.nativeElement.querySelector('.govuk-standalone-tabs__list-item');
      expect(listElementsWithStandaloneClass).toBeFalsy();

      const listElementsWithSubClass = fixture.nativeElement.querySelector('.govuk-subsidiary-tabs__list-item');
      expect(listElementsWithSubClass).toBeTruthy();
    });
  });
});