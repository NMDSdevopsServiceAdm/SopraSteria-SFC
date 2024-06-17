import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ArticleResolver } from '@core/resolvers/article.resolver';
import { SharedModule } from '@shared/shared.module';

import { BenefitAccordionComponent } from './benefit-accordion/benefit-accordion.component';
import { TailoredSeminarsComponent } from './benefit-tailored-seminars/benefit-tailored-seminars.component';
import { BenefitsBundleRoutingModule } from './benefits-bundle-routing.module';
import { BenefitsBundleComponent } from './benefits-bundle.component';
import { BenefitsELearningComponent } from './benefits-elearning/benefits-elearning.component';
import { BenefitsTrainingDiscountsComponent } from './benefits-training-discounts/benefits-training-discounts.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, OverlayModule, BenefitsBundleRoutingModule],
  declarations: [BenefitsBundleComponent, BenefitsTrainingDiscountsComponent, BenefitsELearningComponent, TailoredSeminarsComponent, BenefitAccordionComponent],
  providers: [ArticleResolver],
})
export class BenefitsBundleModule {}
