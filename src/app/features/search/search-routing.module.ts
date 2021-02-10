import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmailCampaignHistoryResolver } from '@core/resolvers/admin/email-campaign-history.resolver';
import { InactiveWorkplacesResolver } from '@core/resolvers/admin/inactive-workplaces.resolver';

import { SearchComponent } from './search.component';

const routes: Routes = [
  {
    path: '',
    component: SearchComponent,
    data: { title: 'Search' },
    resolve: {
      emailCampaignHistory: EmailCampaignHistoryResolver,
      inactiveWorkplaces: InactiveWorkplacesResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchRoutingModule {}
