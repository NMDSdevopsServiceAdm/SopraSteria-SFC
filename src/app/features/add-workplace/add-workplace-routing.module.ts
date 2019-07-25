import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParentGuard } from '@core/guards/parent/parent.guard';
import { StartComponent } from './start/start.component';

const routes: Routes = [
  {
    path: 'start',
    component: StartComponent,
    canActivate: [ParentGuard],
    data: { title: 'Add Workplace' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddWorkplaceRoutingModule {}
