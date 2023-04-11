import { Location } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TabsService } from '@core/services/tabs.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { NewTabsComponent } from './new-tabs.component';

describe('NewTabsComponent', () => {
  const setup = async (dashboardView = true) => {
    const { fixture, getByTestId } = await render(NewTabsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [TabsService],
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
});
