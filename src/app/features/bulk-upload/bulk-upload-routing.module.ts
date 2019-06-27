import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BulkUploadGuard } from '@core/guards/bulk-upload/bulk-upload.guard';
import {
  BulkUploadWelcomePageComponent,
} from '@features/bulk-upload//bulk-upload-welcome-page/bulk-upload-welcome-page.component';
import {
  WorkplaceReferencesPageComponent,
} from '@features/bulk-upload//workplace-references-page/workplace-references-page.component';
import { BulkUploadPageComponent } from '@features/bulk-upload/bulk-upload-page/bulk-upload-page.component';

const routes: Routes = [
  {
    path: '',
    component: BulkUploadPageComponent,
    canActivate: [BulkUploadGuard],
  },
  {
    path: 'welcome',
    component: BulkUploadWelcomePageComponent,
  },
  {
    path: 'workplace-references',
    component: WorkplaceReferencesPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BulkUploadRoutingModule {}
