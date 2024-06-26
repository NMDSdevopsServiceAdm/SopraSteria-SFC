import { Injectable } from '@angular/core';
import { TabsService } from '@core/services/tabs.service';
import { PreviousRouteService } from '@core/services/previous-route.service';
import { Observable, of } from 'rxjs';

@Injectable()
export class MockTabsService extends TabsService {
  private _selectedTab: string;

  public static factory(tab: string = 'home') {
    return (previousRouteService: PreviousRouteService) => {
      const service = new MockTabsService(previousRouteService);
      service._selectedTab = tab;
      return service;
    };
  }

  public get selectedTab$(): Observable<string> {
    return of(this._selectedTab);
  }
}
