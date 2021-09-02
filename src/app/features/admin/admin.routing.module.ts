import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GetDatesResolver } from '@core/resolvers/admin/local-authorities-return/get-dates.resolver';
import { GetLaResolver } from '@core/resolvers/admin/local-authorities-return/get-la.resolver';
import { GetLasResolver } from '@core/resolvers/admin/local-authorities-return/get-las.resolver';

import { LocalAuthoritiesReturnComponent } from './local-authorities-return/local-authorities-return.component';
import { LocalAuthorityComponent } from './local-authorities-return/monitor/local-authority/local-authority.component';
import { MonitorComponent } from './local-authorities-return/monitor/monitor.component';
import { SetDatesComponent } from './local-authorities-return/set-dates/set-dates.component';
import { RegistrationRequestsComponent } from './registration-requests/registration-requests.component';
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
        children: [
          {
            path: '',
            component: MonitorComponent,
            data: {
              title: 'Monitor Returns',
            },
            resolve: {
              localAuthorities: GetLasResolver,
            },
          },
          {
            path: ':uid',
            component: LocalAuthorityComponent,
            data: {
              title: 'Local Authority',
            },
            resolve: {
              localAuthority: GetLaResolver,
            },
          },
        ],
      },
    ],
  },
  {
    path: 'registrations',
    children: [
      {
        path: '',
        component: RegistrationRequestsComponent,
        data: { title: 'Registration Requests' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
