import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WizardResolver } from '@core/resolvers/wizard/wizard.resolver';

import { GetStartedComponent } from './get-started/get-started.component';

const routes: Routes = [
  {
    path: 'get-started',
    component: GetStartedComponent,
    resolve: {
      wizard: WizardResolver,
    },
    data: { title: 'Get started' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HelpRoutingModule {}
