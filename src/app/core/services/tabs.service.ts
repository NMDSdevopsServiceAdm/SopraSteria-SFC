import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface Tab {
  title: string;
  slug: string;
  active: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TabsService {
  public homeTab: Tab = { title: 'Home', slug: 'home', active: false };
  public workplaceTab: Tab = { title: 'Workplace', slug: 'workplace', active: false };
  public staffRecordsTab: Tab = { title: 'Staff records', slug: 'staff-records', active: false };
  public tAndQTab: Tab = { title: 'Training and qualifications', slug: 'training-and-qualifications', active: false };
  public benchmarksTab: Tab = { title: 'Benchmarks', slug: 'benchmarks', active: false };

  private _selectedTab$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  public get selectedTab$(): Observable<string> {
    return this._selectedTab$.asObservable();
  }

  public get selectedTab(): string {
    return this._selectedTab$.value;
  }

  public set selectedTab(tab: string) {
    this._selectedTab$.next(tab);
  }
}
