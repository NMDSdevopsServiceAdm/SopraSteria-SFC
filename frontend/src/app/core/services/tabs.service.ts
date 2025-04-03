import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PreviousRouteService } from './previous-route.service';

export interface Tab {
  title: string;
  slug: string;
  active: boolean;
}

export interface TabChangeEvent {
  tabSlug: string;
  shouldNavigate: boolean;
}

export const MainDashboardTabs = {
  homeTab: { title: 'Home', slug: 'home', active: false },
  workplaceTab: { title: 'Workplace', slug: 'workplace', active: false },
  staffRecordsTab: { title: 'Staff records', slug: 'staff-records', active: false },
  tAndQTab: { title: 'Training and qualifications', slug: 'training-and-qualifications', active: false },
  benchmarksTab: { title: 'Benchmarks', slug: 'benchmarks', active: false },
};

export const SubsidiaryViewTabs = {
  workplaceUsersTab: { title: 'Workplace users', slug: 'workplace-users', active: false },
};

export const UrlPartsRelatedToTabs = [
  { urlPart: 'staff-record', tabSlug: MainDashboardTabs.staffRecordsTab.slug },
  { urlPart: 'staff-records', tabSlug: MainDashboardTabs.staffRecordsTab.slug },
  { urlPart: 'training-and-qualifications-record', tabSlug: MainDashboardTabs.tAndQTab.slug },
  { urlPart: 'training-and-qualifications', tabSlug: MainDashboardTabs.tAndQTab.slug },
  { urlPart: 'benchmarks', tabSlug: MainDashboardTabs.benchmarksTab.slug },
  { urlPart: 'workplace-users', tabSlug: SubsidiaryViewTabs.workplaceUsersTab.slug },
];

@Injectable({
  providedIn: 'root',
})
export class TabsService {
  public homeTab: Tab = MainDashboardTabs.homeTab;
  public workplaceTab: Tab = MainDashboardTabs.workplaceTab;
  public staffRecordsTab: Tab = MainDashboardTabs.staffRecordsTab;
  public tAndQTab: Tab = MainDashboardTabs.tAndQTab;
  public benchmarksTab: Tab = MainDashboardTabs.benchmarksTab;
  public workplaceUsersTab: Tab = SubsidiaryViewTabs.workplaceUsersTab;

  constructor(private previousRouteService: PreviousRouteService) {}

  private _selectedTab$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private _tabChangeEvents$: BehaviorSubject<TabChangeEvent> = new BehaviorSubject<TabChangeEvent>(null);

  public get selectedTab$(): Observable<string> {
    return this._selectedTab$.asObservable();
  }

  public get tabChangeEvents$(): Observable<TabChangeEvent> {
    return this._tabChangeEvents$.asObservable();
  }

  public get selectedTab(): string {
    return this._selectedTab$.value;
  }

  public set selectedTab(tab: string) {
    this.previousRouteService.setLastSelectedTab(tab);
    this._selectedTab$.next(tab);

    this._tabChangeEvents$.next({ tabSlug: tab, shouldNavigate: true });
  }

  public changeTabWithoutNavigation(tabSlug: string) {
    this.previousRouteService.setLastSelectedTab(tabSlug);
    this._selectedTab$.next(tabSlug);
    this._tabChangeEvents$.next({ tabSlug: tabSlug, shouldNavigate: false });
  }
}
