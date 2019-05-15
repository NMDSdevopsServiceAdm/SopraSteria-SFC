import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BulkUploadPageComponent } from '@features/bulk-upload/bulk-upload-page/bulk-upload-page.component';

const routes: Routes = [
  {
    path: '',
    component: BulkUploadPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BulkUploadRoutingModule {}
