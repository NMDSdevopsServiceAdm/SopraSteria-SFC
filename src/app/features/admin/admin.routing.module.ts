import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GetCQCStatusChangeResolver } from '@core/resolvers/admin/cqc-main-service-change-list/get-cqc-main-service-change-list.resolver';
import { EmailTemplateResolver } from '@core/resolvers/admin/email-template.resolver';
import { GetDatesResolver } from '@core/resolvers/admin/local-authorities-return/get-dates.resolver';
import { GetLaResolver } from '@core/resolvers/admin/local-authorities-return/get-la.resolver';
import { GetLasResolver } from '@core/resolvers/admin/local-authorities-return/get-las.resolver';
import { ParentRequestsListResolver } from '@core/resolvers/admin/parent-requests-list/parent-requests-list.resolver';
import { GetRegistrationsResolver } from '@core/resolvers/admin/registration-requests/get-registrations.resolver';
import { GetRegistrationNotesResolver } from '@core/resolvers/admin/registration-requests/single-registration/get-registration-notes.resolver';
import { GetSingleRegistrationResolver } from '@core/resolvers/admin/registration-requests/single-registration/get-single-registration.resolver';

import { CQCMainServiceChangeListComponent } from './cqc-main-service-change-list/cqc-main-service-change-list.component';
import { CqcIndividualMainServiceChangeComponent } from './cqc-main-service-change/cqc-individual-main-service-change/cqc-individual-main-service-change.component';
import { EmailsComponent } from './emails/emails.component';
import { TargetedEmailsComponent } from './emails/targeted-emails/targeted-emails.component';
import { ExternalLinkComponent } from './external-link/external-link.component';
import { LocalAuthoritiesReturnComponent } from './local-authorities-return/local-authorities-return.component';
import { LocalAuthorityComponent } from './local-authorities-return/monitor/local-authority/local-authority.component';
import { MonitorComponent } from './local-authorities-return/monitor/monitor.component';
import { SetDatesComponent } from './local-authorities-return/set-dates/set-dates.component';
import { ParentRequestsListComponent } from './parent-requests/parent-requests-list.component';
import { PendingRegistrationRequestsComponent } from './registration-requests/pending-registration-requests/pending-registration-requests.component';
import { RegistrationRequestComponent } from './registration-requests/registration-request/registration-request.component';
import { RegistrationRequestsComponent } from './registration-requests/registration-requests.component';
import { RejectedRegistrationRequestComponent } from './registration-requests/rejected-registration-request/rejected-registration-request.component';
import { RejectedRegistrationRequestsComponent } from './registration-requests/rejected-registration-requests/rejected-registration-requests.component';
import { ReportComponent } from './report/admin-report.component';
import { SearchForGroupComponent } from './search/search-for-group/search-for-group.component';
import { SearchForUserComponent } from './search/search-for-user/search-for-user.component';
import { SearchForWorkplaceComponent } from './search/search-for-workplace/search-for-workplace.component';
import { SearchComponent } from './search/search.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'search',
    pathMatch: 'full',
  },
  {
    path: 'search',
    children: [
      {
        path: '',
        component: SearchComponent,
        data: {
          title: 'Search',
        },
        children: [
          {
            path: '',
            redirectTo: 'workplace',
            pathMatch: 'full',
          },
          {
            path: 'workplace',
            component: SearchForWorkplaceComponent,
            data: { title: 'Search For A Workplace' },
          },
          {
            path: 'user',
            component: SearchForUserComponent,
            data: { title: 'Search For A User' },
          },
          {
            path: 'group',
            component: SearchForGroupComponent,
            data: { title: 'Search For A Group' },
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
      {
        path: 'pending/:establishmentUid',
        component: RegistrationRequestComponent,
        data: { title: 'Registration Request' },
        resolve: {
          registration: GetSingleRegistrationResolver,
          notes: GetRegistrationNotesResolver,
        },
      },
      {
        path: 'rejected/:establishmentUid',
        component: RejectedRegistrationRequestComponent,
        data: { title: 'Rejected Registration Request' },
        resolve: {
          registration: GetSingleRegistrationResolver,
          notes: GetRegistrationNotesResolver,
        },
      },
    ],
  },
  {
    path: 'parent-requests',
    children: [
      {
        path: '',
        component: ParentRequestsListComponent,
        data: { title: 'Parent requests' },
        resolve: {
          parentRequests: ParentRequestsListResolver,
        },
      },
    ],
  },
  {
    path: 'cqc-main-service-change',
    children: [
      {
        path: '',
        component: CQCMainServiceChangeListComponent,
        data: { title: 'CQC main service change' },
        resolve: {
          cqcStatusChangeList: GetCQCStatusChangeResolver,
        },
      },
      {
        path: 'cqc-main-service-change',
        component: CqcIndividualMainServiceChangeComponent,
        data: { title: 'CQC Individual Main Service Change' },
      },
    ],
  },
  {
    path: 'emails',
    children: [
      {
        path: '',
        component: EmailsComponent,
        data: { title: 'Emails' },

        children: [
          {
            path: 'targeted-emails',
            component: TargetedEmailsComponent,
            data: { title: 'Targeted Emails' },
            resolve: {
              emailTemplates: EmailTemplateResolver,
            },
          },
        ],
      },
    ],
  },
  {
    path: 'admin-reports',
    children: [
      {
        path: '',
        component: ReportComponent,
        data: { title: 'Admin reports' },
      },
    ],
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
    path: 'external-links',
    children: [
      {
        path: '',
        component: ExternalLinkComponent,
        data: { title: 'External Links' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
