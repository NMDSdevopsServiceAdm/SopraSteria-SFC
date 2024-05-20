import { Location } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TabsService } from '@core/services/tabs.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { NewTabsComponent } from './new-tabs.component';

describe('NewTabsComponent', () => {
  const setup = async (dashboardView = true, urlSegments = []) => {
    const { fixture, getByTestId } = await render(NewTabsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        TabsService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              _urlSegment: {
                children: {
                  primary: {
                    segments: urlSegments,
                  },
                },
              },
            },
          },
        },
      ],
      declarations: [],
      componentProperties: {
        tabs: [
          { title: 'Home', slug: 'home', active: false },
          { title: 'Workplace', slug: 'workplace', active: false },
          { title: 'Staff records', slug: 'staff-records', active: false },
          { title: 'Training and qualifications', slug: 'training-and-qualifications', active: false },
          { title: 'Benchmarks', slug: 'benchmarks', active: false },
        ],
        dashboardView,
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
      routerSpy,
      locationSpy,
      parentSubsidiaryViewService,
    };
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
      const homeTab = getByTestId('tab_home');
      const staffRecordsTab = getByTestId('tab_staff-records');
      const tAndQTab = getByTestId('tab_training-and-qualifications');
      const benchmarksTab = getByTestId('tab_benchmarks');

      fireEvent.click(workplaceTab);
      fixture.detectChanges();

      expect(workplaceTab.getAttribute('class')).toContain('asc-tab--active');
      expect(homeTab.getAttribute('class')).not.toContain('asc-tab--active');
      expect(staffRecordsTab.getAttribute('class')).not.toContain('asc-tab--active');
      expect(tAndQTab.getAttribute('class')).not.toContain('asc-tab--active');
      expect(benchmarksTab.getAttribute('class')).not.toContain('asc-tab--active');
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

      expect(locationSpy).toHaveBeenCalledWith('/dashboard#training-and-qualifications');
      expect(routerSpy).not.toHaveBeenCalled();
    });

    it('should navigate to the correct tab when a tab is clicked from a different page', async () => {
      const { fixture, getByTestId, locationSpy, routerSpy } = await setup(false);

      const tAndQTab = getByTestId('tab_training-and-qualifications');

      fireEvent.click(tAndQTab);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'training-and-qualifications' });
      expect(locationSpy).not.toHaveBeenCalled();
    });

    it('should navigate to the sub tab url when tab clicked in sub view', async () => {
      const { getByTestId, parentSubsidiaryViewService, routerSpy } = await setup();
      const subUid = 'abcde123';

      spyOn(parentSubsidiaryViewService, 'getViewingSubAsParent').and.returnValue(true);
      spyOn(parentSubsidiaryViewService, 'getSubsidiaryUid').and.returnValue(subUid);

      const tAndQTab = getByTestId('tab_training-and-qualifications');
      fireEvent.click(tAndQTab);

      expect(routerSpy).toHaveBeenCalledWith([`/subsidiary/${subUid}/training-and-qualifications`]);
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
      const urlSegments = [{ path: 'dashboard' }];

      const { component } = await setup(true, urlSegments);
      const returned = component.getTabSlugInSubView();
      expect(returned).toEqual(null);
    });

    it('should return null when more than 3 segments in url path', async () => {
      const urlSegments = [
        { path: 'subsidiary' },
        { path: 'workplace' },
        { path: 'testuid' },
        { path: 'staff-record' },
      ];

      const { component } = await setup(true, urlSegments);
      const returned = component.getTabSlugInSubView();
      expect(returned).toEqual(null);
    });

    it('should return null when 3 segments but second segment does not match tab slug name', async () => {
      const urlSegments = [{ path: 'subsidiary' }, { path: 'articles' }, { path: 'news-article' }];

      const { component } = await setup(true, urlSegments);
      const returned = component.getTabSlugInSubView();
      expect(returned).toEqual(null);
    });

    it('should return tab slug when 3 segments and second segment matches tab slug', async () => {
      const urlSegments = [{ path: 'subsidiary' }, { path: 'testuid' }, { path: 'training-and-qualifications' }];

      const { component } = await setup(true, urlSegments);
      const returned = component.getTabSlugInSubView();
      expect(returned).toEqual('training-and-qualifications');
    });
  });

  describe('getTabSlugFromNavigationEvent', async () => {
    it(`should return correct tab when third section of url is the tab slug`, async () => {
      const { component } = await setup(true, []);
      component.tabs.forEach((tab) => {
        const url = `/subsidiary/test-uid/${tab.slug}`;
        const result = component.getTabSlugFromNavigationEvent(new NavigationEnd(0, url, url));

        expect(result).toEqual(tab);
      });
    });

    it('should return nothing when no tab slug in the navigation event url', async () => {
      const { component } = await setup(true, []);

      const result = component.getTabSlugFromNavigationEvent(new NavigationEnd(0, 'test-url.com', 'test-url.com'));

      expect(result).toBeFalsy();
    });

    it('should return nothing when workplace in url but in wrong section', async () => {
      const { component } = await setup(true, []);
      const url = '/subsidiary/workplace/test-uid/main-service-cqc';
      const result = component.getTabSlugFromNavigationEvent(new NavigationEnd(0, url, url));

      expect(result).toBeFalsy();
    });

    it('should return nothing when url has fewer than 3 sections', async () => {
      const { component } = await setup(true, []);
      const url = '/subsidiary/benefits-bundle';
      const result = component.getTabSlugFromNavigationEvent(new NavigationEnd(0, url, url));

      expect(result).toBeFalsy();
    });
  });

  describe('selectTab', () => {
    it('should navigate when in sub view and isOnPageLoad is passed in as false', async () => {
      const { component, routerSpy, parentSubsidiaryViewService } = await setup(true, []);

      const index = 1;
      const subUid = 'abcde123';
      spyOn(parentSubsidiaryViewService, 'getViewingSubAsParent').and.returnValue(true);
      spyOn(parentSubsidiaryViewService, 'getSubsidiaryUid').and.returnValue(subUid);

      component.selectTab(new Event(null), index, true, true, false);

      expect(routerSpy).toHaveBeenCalledWith([`/subsidiary/${subUid}/${component.tabs[index].slug}`]);
    });

    it('should not navigate when isOnPageLoad is passed in as true in sub view', async () => {
      const { component, routerSpy, parentSubsidiaryViewService } = await setup(true, []);

      const index = 1;
      const subUid = 'abcde123';
      spyOn(parentSubsidiaryViewService, 'getViewingSubAsParent').and.returnValue(true);
      spyOn(parentSubsidiaryViewService, 'getSubsidiaryUid').and.returnValue(subUid);

      component.selectTab(new Event(null), index, true, true, true);

      expect(routerSpy).not.toHaveBeenCalled();
    });

    it('should not navigate when isOnPageLoad is passed in as false but not in sub view', async () => {
      const { component, routerSpy, parentSubsidiaryViewService } = await setup(true, []);

      const index = 1;
      const subUid = 'abcde123';
      spyOn(parentSubsidiaryViewService, 'getViewingSubAsParent').and.returnValue(false);
      spyOn(parentSubsidiaryViewService, 'getSubsidiaryUid').and.returnValue(subUid);

      component.selectTab(new Event(null), index, true, true, false);

      expect(routerSpy).not.toHaveBeenCalled();
    });
  });
});
