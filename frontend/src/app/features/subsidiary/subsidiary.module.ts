import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BenchmarksResolver } from '@core/resolvers/benchmarks.resolver';
import { CareWorkforcePathwayUseReasonsResolver } from '@core/resolvers/care-workforce-pathway-use-reasons.resolver';
import { CareWorkforcePathwayWorkplaceAwarenessAnswersResolver } from '@core/resolvers/careWorkforcePathway/care-workforce-pathway-workplace-awareness';
import { GetNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswerResolver } from '@core/resolvers/careWorkforcePathway/no-of-workers-with-care-workforce-pathway-category-role-unanswered.resolver';
import { ExpiresSoonAlertDatesResolver } from '@core/resolvers/expiresSoonAlertDates.resolver';
import { FeatureFlagsResolver } from '@core/resolvers/feature-flags.resolver';
import { GetMissingCqcLocationsResolver } from '@core/resolvers/getMissingCqcLocations/getMissingCqcLocations.resolver';
import { GetNoOfWorkersWhoRequireInternationalRecruitmentAnswersResolver } from '@core/resolvers/international-recruitment/no-of-workers-who-require-international-recruitment-answers.resolver';
import { JobsResolver } from '@core/resolvers/jobs.resolver';
import { RankingsResolver } from '@core/resolvers/rankings.resolver';
import { UsefulLinkPayResolver } from '@core/resolvers/useful-link-pay.resolver';
import { UsefulLinkRecruitmentResolver } from '@core/resolvers/useful-link-recruitment.resolver';
import { UserAccountResolver } from '@core/resolvers/user-account.resolver';
import { WorkplaceResolver } from '@core/resolvers/workplace.resolver';
import { DialogService } from '@core/services/dialog.service';
import { BenchmarksModule } from '@shared/components/benchmarks-tab/benchmarks.module';
import { DataAreaTabModule } from '@shared/components/data-area-tab/data-area-tab.module';
import { SharedModule } from '@shared/shared.module';

import { ViewSubsidiaryBenchmarksComponent } from './benchmarks/view-subsidiary-benchmarks.component';
import { ViewSubsidiaryHomeComponent } from './home/view-subsidiary-home.component';
import { ViewSubsidiaryStaffRecordsComponent } from './staff-records/view-subsidiary-staff-records.component';
import { SubsidiaryRoutingModule } from './subsidiary-routing.module';
import { ViewSubsidiaryTrainingAndQualificationsComponent } from './training-and-qualifications/view-subsidiary-training-and-qualifications.component';
import { ViewSubsidiaryWorkplaceUsersComponent } from './workplace-users/view-subsidiary-workplace-users.component';
import { ViewSubsidiaryWorkplaceComponent } from './workplace/view-subsidiary-workplace.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    OverlayModule,
    SubsidiaryRoutingModule,
    BenchmarksModule,
    DataAreaTabModule,
  ],
  declarations: [
    ViewSubsidiaryHomeComponent,
    ViewSubsidiaryWorkplaceComponent,
    ViewSubsidiaryHomeComponent,
    ViewSubsidiaryStaffRecordsComponent,
    ViewSubsidiaryTrainingAndQualificationsComponent,
    ViewSubsidiaryBenchmarksComponent,
    ViewSubsidiaryWorkplaceUsersComponent,
  ],
  providers: [
    DialogService,
    WorkplaceResolver,
    UserAccountResolver,
    ExpiresSoonAlertDatesResolver,
    JobsResolver,
    BenchmarksResolver,
    RankingsResolver,
    UsefulLinkPayResolver,
    UsefulLinkRecruitmentResolver,
    GetMissingCqcLocationsResolver,
    GetNoOfWorkersWhoRequireInternationalRecruitmentAnswersResolver,
    GetNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswerResolver,
    FeatureFlagsResolver,
    CareWorkforcePathwayUseReasonsResolver,
    CareWorkforcePathwayWorkplaceAwarenessAnswersResolver,
  ],
})
export class SubsidiaryModule {}
