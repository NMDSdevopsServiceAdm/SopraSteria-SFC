import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GetDatesResolver } from '@core/resolvers/admin/local-authorities-return/get-dates.resolver';
import { GetLasResolver } from '@core/resolvers/admin/local-authorities-return/get-las.resolver';

import { LocalAuthoritiesReturnComponent } from './local-authorities-return/local-authorities-return.component';
import { MonitorComponent } from './local-authorities-return/monitor/monitor.component';
import { SetDatesComponent } from './local-authorities-return/set-dates/set-dates.component';
import { SearchComponent } from './search/search.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'search',
    pathMatch: 'full',
  },
  {
    path: 'search',
    component: SearchComponent,
    data: {
      title: 'Search',
    },
  },
  {
    path: 'local-authorities-return',
    children: [
      {
        path: '',
        component: LocalAuthoritiesReturnComponent,
        data: {
          title: 'Local Authorities Return',
        },
        resolve: {
          dates: GetDatesResolver,
        },
      },
      {
        path: 'set-dates',
        component: SetDatesComponent,
        data: {
          title: 'Set Start and End Dates',
        },
        resolve: {
          dates: GetDatesResolver,
        },
      },
      {
        path: 'monitor',
        component: MonitorComponent,
        data: {
          title: 'Monitor Returns',
        },
        resolve: {
          dates: GetLasResolver,
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
