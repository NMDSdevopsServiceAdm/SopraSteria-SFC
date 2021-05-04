import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HowDidYouHearAboutComponent } from './how-did-you-hear-about/how-did-you-hear-about.component';
import { ParticipationComponent } from './participation/participation.component';
import { ThankYouComponent } from './thank-you/thank-you.component';
import { WhyCreateAccountComponent } from './why-create-account/why-create-account.component';

const routes: Routes = [
  {
    path: '',
    component: ParticipationComponent,
    data: { title: 'Registration Survey' },
  },
  {
    path: 'why-create-account',
    component: WhyCreateAccountComponent,
    data: { title: 'Registration Survey' },
  },
  {
    path: 'how-did-you-hear-about',
    component: HowDidYouHearAboutComponent,
    data: { title: 'Registration Survey' },
  },
  {
    path: 'thank-you',
    component: ThankYouComponent,
    data: { title: 'Registration Survey' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistrationSurveyRoutingModule {}
