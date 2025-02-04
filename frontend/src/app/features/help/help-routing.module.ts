import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WizardResolver } from '@core/resolvers/wizard/wizard.resolver';

import { GetStartedComponent } from './get-started/get-started.component';
import { HelpAreaComponent } from './help-area/help-area.component';
import { WhatsNewComponent } from './whats-new/whats-new.component';
import { HelpPageResolver } from '@core/resolvers/help-pages.resolver';
import { HelpfulDownloadsComponent } from './helpful-downloads/helpful-downloads.component';

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
        resolve: {
          helpPage: HelpPageResolver,
        },
        data: { title: "What's new" },
      },
      {
        path: 'helpful-downloads',
        component: HelpfulDownloadsComponent,
        data: { title: "Helpful Downloads"},
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HelpRoutingModule {}
