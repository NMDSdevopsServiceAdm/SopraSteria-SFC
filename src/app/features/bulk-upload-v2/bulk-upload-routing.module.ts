import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BulkUploadGuard } from '@core/guards/bulk-upload/bulk-upload.guard';
import { StaffReferencesResolver } from '@core/resolvers/staff-references.resolver';
import { WorkplacesReferencesResolver } from '@core/resolvers/workplace-references.resolver';
import { AboutBulkUploadComponent } from '@features/bulk-upload-v2/about-bulk-upload/about-bulk-upload.component';
import { BulkUploadPageV2Component } from '@features/bulk-upload-v2/bulk-upload-page/bulk-upload-page.component';
import { BulkUploadStartPageComponent } from '@features/bulk-upload/bulk-upload-start-page/bulk-upload-start-page.component';
import { ReferencesCreatedPageComponent } from '@features/bulk-upload/references-created-page/references-created-page.component';

import { StaffReferencesComponent } from './bulk-upload-references/staff-references/staff-references-page.component';
import { WorkplaceReferencesComponent } from './bulk-upload-references/workplace-references/workplace-references-page.component';
import { ErrorPageComponent } from './error-page/error-page.component';

const routes: Routes = [
  {
    path: '',
    component: BulkUploadPageV2Component,
    canActivate: [BulkUploadGuard],
    data: { title: 'Home' },
  },
  {
    path: 'start',
    component: BulkUploadStartPageComponent,
    data: { title: 'Start' },
  },
  {
    path: 'about-bulk-upload',
    component: AboutBulkUploadComponent,
    data: { title: 'About bulk upload' },
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
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'workplace-and-staff-references/success',
    component: ReferencesCreatedPageComponent,
    data: { title: 'Workplace and staff references complete' },
  },
  {
    path: 'error-report',
    component: ErrorPageComponent,
    data: { title: 'Error Report' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BulkUploadV2RoutingModule {}
