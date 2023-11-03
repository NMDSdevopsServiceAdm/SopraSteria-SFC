import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ChildWorkplacesResolver } from '@core/resolvers/child-workplaces.resolver';
import { ExpiresSoonAlertDatesResolver } from '@core/resolvers/expiresSoonAlertDates.resolver';
import { JobsResolver } from '@core/resolvers/jobs.resolver';
import { UserAccountResolver } from '@core/resolvers/user-account.resolver';
import { WorkplaceResolver } from '@core/resolvers/workplace.resolver';
import { DialogService } from '@core/services/dialog.service';
import { CreateUserAccountComponent } from '@features/workplace/create-user-account/create-user-account.component';
import { SelectMainServiceCqcConfirmComponent } from '@features/workplace/select-main-service/select-main-service-cqc-confirm.component';
import { SelectMainServiceCqcComponent } from '@features/workplace/select-main-service/select-main-service-cqc.component';
import { StartComponent } from '@features/workplace/start/start.component';
import { UserAccountSavedComponent } from '@features/workplace/user-account-saved/user-account-saved.component';
import { UserAccountViewComponent } from '@features/workplace/user-account-view/user-account-view.component';
import { BenchmarksModule } from '@shared/components/benchmarks-tab/benchmarks.module';
import { DataAreaTabModule } from '@shared/components/data-area-tab/data-area-tab.module';
import { SharedModule } from '@shared/shared.module';

import { AcceptPreviousCareCertificateComponent } from '@features/workplace/accept-previous-care-certificate/accept-previous-care-certificate.component';
import { BenefitsStatutorySickPayComponent } from '@features/workplace/benefits-statutory-sick-pay/benefits-statutory-sick-pay.component';
import { ChangeExpiresSoonAlertsComponent } from '@features/workplace/change-expires-soon-alerts/change-expires-soon-alerts.component';
import { CheckAnswersComponent } from '@features/workplace/check-answers/check-answers.component';
import { ConfirmLeaversComponent } from '@features/workplace/confirm-leavers/confirm-leavers.component';
import { ConfirmStaffRecruitmentAndBenefitsComponent } from '@features/workplace/confirm-staff-recruitment/confirm-staff-recruitment-and-benefits.component';
import { ConfirmStartersComponent } from '@features/workplace/confirm-starters/confirm-starters.component';
import { ConfirmVacanciesComponent } from '@features/workplace/confirm-vacancies/confirm-vacancies.component';
import { DataSharingComponent } from '@features/workplace/data-sharing/data-sharing.component';
import { DeleteUserAccountComponent } from '@features/workplace/delete-user-account/delete-user-account.component';
import { EditWorkplaceComponent } from '@features/workplace/edit-workplace/edit-workplace.component';
import { LeaversComponent } from '@features/workplace/leavers/leavers.component';
import { NumberOfInterviewsComponent } from '@features/workplace/number-of-interviews/number-of-interviews.component';
import { OtherServicesComponent } from '@features/workplace/other-services/other-services.component';
import { PensionsComponent } from '@features/workplace/pensions/pensions.component';
import { RecruitmentAdvertisingCostComponent } from '@features/workplace/recruitment-advertising-cost/recruitment-advertising-cost.component';
import { RegulatedByCqcComponent } from '@features/workplace/regulated-by-cqc/regulated-by-cqc.component';
import { SelectMainServiceComponent } from '@features/workplace/select-main-service/select-main-service.component';
import { SelectPrimaryUserDeleteComponent } from '@features/workplace/select-primary-user-delete/select-primary-user-delete.component';
import { SelectPrimaryUserComponent } from '@features/workplace/select-primary-user/select-primary-user.component';
import { SelectWorkplaceComponent } from '@features/workplace/select-workplace/select-workplace.component';
import { ServiceUsersComponent } from '@features/workplace/service-users/service-users.component';
import { ServicesCapacityComponent } from '@features/workplace/services-capacity/services-capacity.component';
import { StaffBenefitCashLoyaltyComponent } from '@features/workplace/staff-benefit-cash-loyalty/staff-benefit-cash-loyalty.component';
import { StaffBenefitHolidayLeaveComponent } from '@features/workplace/staff-benefit-holiday-leave/staff-benefit-holiday-leave.component';
import { StaffRecruitmentCaptureTrainingRequirementComponent } from '@features/workplace/staff-recruitment-capture-training-requirement/staff-recruitment-capture-training-requirement.component';
import { StaffRecruitmentStartComponent } from '@features/workplace/staff-recruitment/staff-recruitment-start.component';
import { StartersComponent } from '@features/workplace/starters/starters.component';
import { TotalStaffQuestionComponent } from '@features/workplace/total-staff-question/total-staff-question.component';
import { TypeOfEmployerComponent } from '@features/workplace/type-of-employer/type-of-employer.component';
//import { UserAccountDeleteDialogComponent } from '@features/workplace/user-account-delete-dialog/user-account-delete-dialog.component';
import { UserAccountEditDetailsComponent } from '@features/workplace/user-account-edit-details/user-account-edit-details.component';
import { UserAccountEditPermissionsComponent } from '@features/workplace/user-account-edit-permissions/user-account-edit-permissions.component';
import { UsersComponent } from '@features/workplace/users/users.component';
import { VacanciesComponent } from '@features/workplace/vacancies/vacancies.component';
import { ViewMyWorkplacesComponent } from '@features/workplace/view-my-workplaces/view-my-workplaces.component';
import { ViewWorkplaceComponent } from '@features/workplace/view-workplace/view-workplace.component';
import { WorkplaceInfoPanelComponent } from '@features/workplace/workplace-info-panel/workplace-info-panel.component';
import { WorkplaceNameAddressComponent } from '@features/workplace/workplace-name-address/workplace-name-address.component';
import { WorkplaceNotFoundComponent } from '@features/workplace/workplace-not-found/workplace-not-found.component';
import { SelectedWorkplaceRoutingModule } from './selected-workplace-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    OverlayModule,
    SelectedWorkplaceRoutingModule,
    BenchmarksModule,
    DataAreaTabModule,
  ],
  declarations: [
    // CheckAnswersComponent,
    // ConfirmLeaversComponent,
    // ConfirmStartersComponent,
    // ConfirmVacanciesComponent,
    // CreateUserAccountComponent,
    // DataSharingComponent,
    // EditWorkplaceComponent,
    // LeaversComponent,
    // OtherServicesComponent,
    // ServicesCapacityComponent,
    // ServiceUsersComponent,
    // StartComponent,
    // StaffRecruitmentStartComponent,
    // StartersComponent,
    // TypeOfEmployerComponent,
    // UserAccountDeleteDialogComponent,
    // UserAccountEditPermissionsComponent,
    // UserAccountSavedComponent,
    // UserAccountViewComponent,
    // TotalStaffQuestionComponent,
    // VacanciesComponent,
    // ViewMyWorkplacesComponent,
    // ViewWorkplaceComponent,
    // WorkplaceInfoPanelComponent,
    // SelectMainServiceComponent,
    // UserAccountEditDetailsComponent,
    // RegulatedByCqcComponent,
    // SelectWorkplaceComponent,
    // WorkplaceNotFoundComponent,
    // WorkplaceNameAddressComponent,
    // SelectMainServiceCqcComponent,
    // SelectMainServiceCqcConfirmComponent,
    // DeleteUserAccountComponent,
    // SelectPrimaryUserComponent,
    // SelectPrimaryUserDeleteComponent,
    // ChangeExpiresSoonAlertsComponent,
    // UsersComponent,
    // StaffRecruitmentCaptureTrainingRequirementComponent,
    // AcceptPreviousCareCertificateComponent,
    // RecruitmentAdvertisingCostComponent,
    // NumberOfInterviewsComponent,
    // ConfirmStaffRecruitmentAndBenefitsComponent,
    // StaffBenefitHolidayLeaveComponent,
    // StaffBenefitCashLoyaltyComponent,
    // BenefitsStatutorySickPayComponent,
    // PensionsComponent,
  ],
  providers: [
    DialogService,
    WorkplaceResolver,
    UserAccountResolver,
    ExpiresSoonAlertDatesResolver,
    ChildWorkplacesResolver,
    JobsResolver,
  ],
})
export class SelectedWorkplaceModule {}
