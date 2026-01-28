import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageResolver } from '@core/resolvers/page.resolver';

import { TailoredSeminarsComponent } from './benefit-tailored-seminars/benefit-tailored-seminars.component';
import { BenefitsBundleComponent } from './benefits-bundle.component';
import { BenefitsELearningComponent } from './benefits-elearning/benefits-elearning.component';
import { BenefitsTrainingDiscountsComponent } from './benefits-training-discounts/benefits-training-discounts.component';

const routes: Routes = [
  {
    path: '',
    component: BenefitsBundleComponent,
    data: { title: 'Benefits Bundle' },
  },
  {
    path: 'training-discounts',
    component: BenefitsTrainingDiscountsComponent,
    data: { title: 'Training Providers Discounts' },
    resolve: {
      pages: PageResolver,
    },
  },
  {
    path: 'elearning-discounts',
    component: BenefitsELearningComponent,
    data: { title: 'eLearning Modules' },
    resolve: {
      pages: PageResolver,
    },
  },
  {
    path: 'tailored-seminars',
    component: TailoredSeminarsComponent,
    data: { title: 'tailored Seminars' },
    resolve: {
      pages: PageResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BenefitsBundleRoutingModule {}
