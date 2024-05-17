import { Location } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SubsidiaryTabsService } from '@core/services/tabs/tabs-interface.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { SubsidiaryTabsComponent } from './subsidiary-tabs.component';

describe('SubsidiaryTabsComponent', () => {
  const setup = async (urlSegments = []) => {
    const { fixture, getByTestId } = await render(SubsidiaryTabsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        SubsidiaryTabsService,
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
      },
    });

    const component = fixture.componentInstance;
    const selectTabSpy = spyOn(component, 'selectTab').and.callThrough();
    const keyUpSpy = spyOn(component, 'onKeyUp').and.callThrough();
    const keyDownSpy = spyOn(component, 'onKeyDown').and.callThrough();

    const injector = getTestBed();
    const tabsService = injector.inject(SubsidiaryTabsService);

    const router = injector.inject(Router);
    const routerSpy = spyOn(router, 'navigate');

    const location = injector.inject(Location);
    const locationSpy = spyOn(location, 'replaceState');

    const parentSubsidiaryViewService = injector.inject(ParentSubsidiaryViewService);
    const subUid = 'abcde123';

    spyOn(parentSubsidiaryViewService, 'getSubsidiaryUid').and.returnValue(subUid);

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
      subUid,
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

    it('should call selectTab and set the selected tab property in the tabs service when a tab is clicked', async () => {
      const { fixture, getByTestId, selectTabSpy, tabsService } = await setup();

      const setSelectedTabSpy = spyOnProperty(tabsService, 'selectedTab', 'set');

      const staffRecordsTab = getByTestId('tab_staff-records');

      fireEvent.click(staffRecordsTab);
      fixture.detectChanges();

      expect(selectTabSpy).toHaveBeenCalled();
      expect(setSelectedTabSpy).toHaveBeenCalledWith('staff-records');
    });

    it('should navigate to the tab url when tab clicked', async () => {
      const { getByTestId, subUid, routerSpy } = await setup();

      const tAndQTab = getByTestId('tab_training-and-qualifications');
      fireEvent.click(tAndQTab);

      expect(routerSpy).toHaveBeenCalledWith([`/subsidiary/training-and-qualifications/${subUid}`]);
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

  describe('getTabSlugFromUrl', () => {
    it('should return null when fewer than 3 segments in url path', async () => {
      const urlSegments = [{ path: 'dashboard' }];

      const { component } = await setup(urlSegments);
      const returned = component.getTabSlugFromUrl();
      expect(returned).toEqual(null);
    });

    it('should return null when more than 3 segments in url path', async () => {
      const urlSegments = [
        { path: 'subsidiary' },
        { path: 'workplace' },
        { path: 'testuid' },
        { path: 'staff-record' },
      ];

      const { component } = await setup(urlSegments);
      const returned = component.getTabSlugFromUrl();
      expect(returned).toEqual(null);
    });

    it('should return null when 3 segments but second segment does not match tab slug name', async () => {
      const urlSegments = [{ path: 'subsidiary' }, { path: 'articles' }, { path: 'news-article' }];

      const { component } = await setup(urlSegments);
      const returned = component.getTabSlugFromUrl();
      expect(returned).toEqual(null);
    });

    it('should return tab slug when 3 segments and second segment matches tab slug', async () => {
      const urlSegments = [{ path: 'subsidiary' }, { path: 'training-and-qualifications' }, { path: 'testuid' }];

      const { component } = await setup(urlSegments);
      const returned = component.getTabSlugFromUrl();
      expect(returned).toEqual('training-and-qualifications');
    });
  });
});
