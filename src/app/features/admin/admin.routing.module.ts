import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GetDatesResolver } from '@core/resolvers/admin/local-authorities-return/get-dates.resolver';
import { GetLaResolver } from '@core/resolvers/admin/local-authorities-return/get-la.resolver';
import { GetLasResolver } from '@core/resolvers/admin/local-authorities-return/get-las.resolver';
import { GetRegistrationsResolver } from '@core/resolvers/admin/registration-requests/get-registrations.resolver';

import { LocalAuthoritiesReturnComponent } from './local-authorities-return/local-authorities-return.component';
import { LocalAuthorityComponent } from './local-authorities-return/monitor/local-authority/local-authority.component';
import { MonitorComponent } from './local-authorities-return/monitor/monitor.component';
import { SetDatesComponent } from './local-authorities-return/set-dates/set-dates.component';
import { PendingRegistrationRequestsComponent } from './registration-requests/pending-registration-requests/pending-registration-requests.component';
import { RegistrationRequestsComponent } from './registration-requests/registration-requests.component';
import { RejectedRegistrationRequestsComponent } from './registration-requests/rejected-registration-requests/rejected-registration-requests.component';
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
    component: RegistrationRequestsComponent,
    data: { title: 'Registration Requests' },
    resolve: {
      registrations: GetRegistrationsResolver,
    },
    children: [
      {
        path: '',
        redirectTo: 'pending',
        pathMatch: 'full',
      },
      {
        path: 'pending',
        component: PendingRegistrationRequestsComponent,
        data: { title: 'Pending Registration Requests' },
        resolve: {
          registrations: GetRegistrationsResolver,
        },
      },
      {
        path: 'rejected',
        component: RejectedRegistrationRequestsComponent,
        data: { title: 'Rejected Registration Requests' },
        resolve: {
          registrations: GetRegistrationsResolver,
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
