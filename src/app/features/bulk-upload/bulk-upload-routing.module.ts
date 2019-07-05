import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BulkUploadGuard } from '@core/guards/bulk-upload/bulk-upload.guard';
import {
  WorkplaceReferencesPageComponent,
} from '@features/bulk-upload//workplace-references-page/workplace-references-page.component';
import { BulkUploadPageComponent } from '@features/bulk-upload/bulk-upload-page/bulk-upload-page.component';
import { BulkUploadStartPageComponent } from '@features/bulk-upload/bulk-upload-start-page/bulk-upload-start-page.component';
import { ReferencesCreatedPageComponent } from '@features/bulk-upload/references-created-page/references-created-page.component';
import { StaffReferencesPageComponent } from '@features/bulk-upload/staff-references-page/staff-references-page.component';

const routes: Routes = [
  {
    path: '',
    component: BulkUploadPageComponent,
    canActivate: [BulkUploadGuard],
    data: { title: 'Home' },
  },
  {
    path: 'start',
    component: BulkUploadStartPageComponent,
    data: { title: 'Start' },
  },
  {
    path: 'workplace-references',
    component: WorkplaceReferencesPageComponent,
    data: { title: 'Workplace references' },
  },
  {
    path: 'staff-references/:uid',
    component: StaffReferencesPageComponent,
    data: { title: 'Staff references' },
  },
  {
    path: 'workplace-and-staff-references/created',
    component: ReferencesCreatedPageComponent,
    data: { title: 'Workplace and staff references complete' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BulkUploadRoutingModule {}
