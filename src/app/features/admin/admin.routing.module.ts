import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LocalAuthoritiesReturnComponent } from './local-authorities-return/local-authorities-return.component';
import { SearchComponent } from './search/search.component';
import { SetDatesComponent } from './set-dates/set-dates.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'search',
  },
  {
    path: 'search',
    component: SearchComponent,
    data: {
      title: 'Search',
    },
  },
  {
    path: 'local-authorities-return',
    component: LocalAuthoritiesReturnComponent,
    data: {
      title: 'Local Authorities Return',
    },
  },
  {
    path: 'local-authorities-return/set-dates',
    component: SetDatesComponent,
    data: { title: 'Set Start and End Dates' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
