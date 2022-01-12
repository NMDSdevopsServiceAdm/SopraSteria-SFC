import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BulkUploadMissingGuard } from '@core/guards/bulk-upload/bulk-upload-missing.guard';
import { BulkUploadStartGuard } from '@core/guards/bulk-upload/bulk-upload-start.guard';
import { RoleGuard } from '@core/guards/role/role.guard';
import { Roles } from '@core/model/roles.enum';
import { BulkUploadErrorsResolver } from '@core/resolvers/bulk-upload-errors.resolver';
import { BulkUploadTopTipResolver } from '@core/resolvers/bulk-upload/bulk-upload-top-tip.resolver';
import { BulkUploadTopTipsListResolver } from '@core/resolvers/bulk-upload/bulk-upload-top-tips-list.resolver';
import { LastBulkUploadResolver } from '@core/resolvers/last-bulk-upload.resolver';
import { MissingWorkplacesReferencesResolver } from '@core/resolvers/missing-workplace-references.resolver';
import { StaffReferencesResolver } from '@core/resolvers/staff-references.resolver';
import { WorkplacesReferencesResolver } from '@core/resolvers/workplace-references.resolver';
import { AboutBulkUploadComponent } from '@features/bulk-upload/about-bulk-upload/about-bulk-upload.component';
import {
  MissingStaffReferencesComponent,
} from '@features/bulk-upload/bulk-upload-references/missing-staff-references/missing-staff-references-page.component';
import {
  MissingWorkplaceReferencesComponent,
} from '@features/bulk-upload/bulk-upload-references/missing-workplace-references/missing-workplace-references-page.component';
import { BulkUploadStartPageComponent } from '@features/bulk-upload/bulk-upload-start-page/bulk-upload-start-page.component';
import { LastBulkUploadComponent } from '@features/bulk-upload/last-bulk-upload/last-bulk-upload.component';

import { BulkUploadFlowchartComponent } from './bulk-upload-flowchart/bulk-upload-flowchart.component';
import { BulkUploadMissingPageComponent } from './bulk-upload-missing/bulk-upload-missing-page.component';
import { BulkUploadPageComponent } from './bulk-upload-page/bulk-upload-page.component';
import { StaffReferencesComponent } from './bulk-upload-references/staff-references/staff-references-page.component';
import {
  WorkplaceReferencesComponent,
} from './bulk-upload-references/workplace-references/workplace-references-page.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { BulkUploadHelpMainPageComponent } from './help-area/bulk-upload-help-main-page.component';
import { BulkUploadTopTipPageComponent } from './help-area/bulk-upload-top-tip-page/bulk-upload-top-tip-page.component';

const routes: Routes = [
  {
    path: '',
    component: BulkUploadPageComponent,
    canActivate: [BulkUploadStartGuard, BulkUploadMissingGuard],
    data: { title: 'Home' },
  },
  {
    path: 'start',
    component: BulkUploadStartPageComponent,
    data: { title: 'Start' },
  },
  {
    path: 'step-by-step-guide',
    component: BulkUploadFlowchartComponent,
    data: { title: 'Flowchart ' },
  },
  {
    path: 'get-help',
    children: [
      {
        path: '',
        component: BulkUploadHelpMainPageComponent,
        data: { title: 'Bulk upload get help main page' },
        resolve: { topTipsList: BulkUploadTopTipsListResolver },
      },
      {
        path: ':slug',
        component: BulkUploadTopTipPageComponent,
        data: { title: 'Top tip' },
        resolve: {
          topTip: BulkUploadTopTipResolver,
          topTipsList: BulkUploadTopTipsListResolver,
        },
      },
    ],
  },
  {
    path: 'about-bulk-upload',
    component: AboutBulkUploadComponent,
    data: { title: 'About bulk upload' },
  },
  {
    path: 'missing',
    component: BulkUploadMissingPageComponent,
    data: { title: 'Missing References' },
  },
  {
    path: 'last-bulk-upload',
    component: LastBulkUploadComponent,
    data: { title: 'Last bulk upload', roles: [Roles.Admin] },
    canActivate: [RoleGuard],
    resolve: { lastBulkUpload: LastBulkUploadResolver },
  },
  {
    path: 'missing-workplace-references',
    component: MissingWorkplaceReferencesComponent,
    resolve: {
      workplaceReferences: WorkplacesReferencesResolver,
      nextWorkplace: MissingWorkplacesReferencesResolver,
    },
    data: { title: 'Workplace references' },
  },
  {
    path: ':uid/missing-staff-references',
    component: MissingStaffReferencesComponent,
    resolve: {
      references: StaffReferencesResolver,
      workplaceReferences: MissingWorkplacesReferencesResolver,
    },
    data: { title: 'Staff references' },
  },
  {
    path: 'workplace-references',
    component: WorkplaceReferencesComponent,
    resolve: { workplaceReferences: WorkplacesReferencesResolver },
    data: { title: 'Workplace references' },
  },
  {
    path: ':uid/staff-references',
    component: StaffReferencesComponent,
    resolve: {
      references: StaffReferencesResolver,
      workplaceReferences: WorkplacesReferencesResolver,
    },
    data: { title: 'Staff references' },
  },
  {
    path: 'error-report',
    component: ErrorPageComponent,
    data: { title: 'Error Report' },
    resolve: { buErrors: BulkUploadErrorsResolver },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BulkUploadRoutingModule {}
