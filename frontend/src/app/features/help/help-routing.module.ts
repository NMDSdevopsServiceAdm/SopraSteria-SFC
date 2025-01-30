import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WizardResolver } from '@core/resolvers/wizard/wizard.resolver';

import { GetStartedComponent } from './get-started/get-started.component';
import { HelpAreaComponent } from './help-area/help-area.component';
import { WhatsNewComponent } from './whats-new/whats-new.component';

const routes: Routes = [
  {
    path: '',
    component: HelpAreaComponent,
    children: [
      {
        path: 'get-started',
        component: GetStartedComponent,
        resolve: {
          wizard: WizardResolver,
        },
        data: { title: 'Get started' },
      },
      {
        path: 'whats-new',
        component: WhatsNewComponent,
        data: { title: "What's new" },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HelpRoutingModule {}
