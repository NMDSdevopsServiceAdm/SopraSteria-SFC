import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DataAreaAboutTheDataComponent } from './about-the-data/about-the-data.component';

const routes: Routes = [
  {
    path: 'about-the-data',
    component: DataAreaAboutTheDataComponent,
    data: {
      title: 'About the data',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DataAreaRoutingModule {}
