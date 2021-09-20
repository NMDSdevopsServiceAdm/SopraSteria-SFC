import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PageNotFoundComponent } from '@core/components/error/page-not-found/page-not-found.component';
import { ArticleListResolver } from '@core/resolvers/article-list.resolver';
import { DialogService } from '@core/services/dialog.service';
import { ArticleListComponent } from '@features/articles/article-list/article-list.component';
import { CqcConfirmationDialogComponent } from '@features/search/cqc-status-change/cqc-confirmation-dialog.component';
import { ParentConfirmationDialogComponent } from '@features/search/parent-request/parent-confirmation-dialog.component';
import {
  DeleteWorkplaceDialogComponent,
} from '@features/workplace/delete-workplace-dialog/delete-workplace-dialog.component';
import { AlertComponent } from '@shared/components/alert/alert.component';
import { CheckCQCDetailsComponent } from '@shared/components/check-cqc-details/check-cqc-details.component';
import { SummaryRecordValueComponent } from '@shared/components/summary-record-value/summary-record-value.component';
import { WorkplaceTabComponent } from '@shared/components/workplace-tab/workplace-tab.component';
import { BulkUploadFileTypePipePipe } from '@shared/pipes/bulk-upload-file-type.pipe';

import { AutoSuggestComponent } from './components/auto-suggest/auto-suggest.component';
import { BackLinkComponent } from './components/back-link/back-link.component';
import { BecomeAParentDialogComponent } from './components/become-a-parent/become-a-parent-dialog.component';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { CancelDataOwnerDialogComponent } from './components/cancel-data-owner-dialog/cancel-data-owner-dialog.component';
import { ChangeDataOwnerDialogComponent } from './components/change-data-owner-dialog/change-data-owner-dialog.component';
import { CharacterCountComponent } from './components/character-count/character-count.component';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { DetailsComponent } from './components/details/details.component';
import { EligibilityIconComponent } from './components/eligibility-icon/eligibility-icon.component';
import { ErrorSummaryComponent } from './components/error-summary/error-summary.component';
import { InsetTextComponent } from './components/inset-text/inset-text.component';
import {
  LinkToParentCancelDialogComponent,
} from './components/link-to-parent-cancel/link-to-parent-cancel-dialog.component';
import {
  LinkToParentRemoveDialogComponent,
} from './components/link-to-parent-remove/link-to-parent-remove-dialog.component';
import { LinkToParentDialogComponent } from './components/link-to-parent/link-to-parent-dialog.component';
import { MessagesComponent } from './components/messages/messages.component';
import { MoveWorkplaceDialogComponent } from './components/move-workplace/move-workplace-dialog.component';
import {
  OwnershipChangeMessageDialogComponent,
} from './components/ownership-change-message/ownership-change-message-dialog.component';
import { PageComponent } from './components/page/page.component';
import { PanelComponent } from './components/panel/panel.component';
import { PhaseBannerComponent } from './components/phase-banner/phase-banner.component';
import { ProgressComponent } from './components/progress/progress.component';
import { RejectRequestDialogComponent } from './components/reject-request-dialog/reject-request-dialog.component';
import { ReviewCheckboxComponent } from './components/review-checkbox/review-checkbox.component';
import { SetDataPermissionDialogComponent } from './components/set-data-permission/set-data-permission-dialog.component';
import { BasicRecordComponent } from './components/staff-record-summary/basic-record/basic-record.component';
import { EmploymentComponent } from './components/staff-record-summary/employment/employment.component';
import { PersonalDetailsComponent } from './components/staff-record-summary/personal-details/personal-details.component';
import {
  QualificationsAndTrainingComponent,
} from './components/staff-record-summary/qualifications-and-training/qualifications-and-training.component';
import { StaffRecordSummaryComponent } from './components/staff-record-summary/staff-record-summary.component';
import { StaffRecordsTabComponent } from './components/staff-records-tab/staff-records-tab.component';
import { StaffSummaryComponent } from './components/staff-summary/staff-summary.component';
import { StatusComponent } from './components/status/status.component';
import { SubmitButtonComponent } from './components/submit-button/submit-button.component';
import { SubmitExitButtonsComponent } from './components/submit-exit-buttons/submit-exit-buttons.component';
import { SummaryListComponent } from './components/summary-list/summary-list.component';
import { SummaryRecordChangeComponent } from './components/summary-record-change/summary-record-change.component';
import { TabComponent } from './components/tabs/tab.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { TotalStaffPanelComponent } from './components/total-staff-panel/total-staff-panel.component';
import { TotalStaffComponent } from './components/total-staff/total-staff.component';
import {
  TrainingAndQualificationsCategoriesComponent,
} from './components/training-and-qualifications-categories/training-and-qualifications-categories.component';
import {
  TrainingAndQualificationsSummaryComponent,
} from './components/training-and-qualifications-summary/training-and-qualifications-summary.component';
import {
  TrainingAndQualificationsTabComponent,
} from './components/training-and-qualifications-tab/training-and-qualifications-tab.component';
import { TrainingInfoPanelComponent } from './components/training-info-panel/training-info-panel.component';
import { TrainingLinkPanelComponent } from './components/training-link-panel/training-link-panel.component';
import { UserAccountsSummaryComponent } from './components/user-accounts-summary/user-accounts-summary.component';
import { WdfConfirmationPanelComponent } from './components/wdf-confirmation-panel/wdf-confirmation-panel.component';
import { WdfFieldConfirmationComponent } from './components/wdf-field-confirmation/wdf-field-confirmation.component';
import {
  WdfStaffMismatchMessageComponent,
} from './components/wdf-staff-mismatch-message/wdf-staff-mismatch-message.component';
import { WhyCollectingFluJabComponent } from './components/why-collecting-flu-jab/why-collecting-flu-jab.component';
import { WorkplaceSummaryComponent } from './components/workplace-summary/workplace-summary.component';
import { FileValueAccessorDirective } from './form-controls/file-control-value-accessor';
import { AbsoluteNumberPipe } from './pipes/absolute-number.pipe';
import { ClosedEndedAnswerPipe } from './pipes/closed-ended-answer.pipe';
import { DataViewPermissionsPipe } from './pipes/data-view-permissions.pipe';
import { FirstErrorPipe } from './pipes/first-error.pipe';
import { LongDatePipe } from './pipes/long-date.pipe';
import { NumericAnswerPipe } from './pipes/numeric-answer.pipe';
import { NursingCategoriesTextPipe } from './pipes/nursing-categories-text.pipe';
import { NursingSpecialismsTextPipe } from './pipes/nursing-specialisms-text.pipe';
import { OpenEndedAnswerPipe } from './pipes/open-ended-answer.pipe';
import { OrderOtherPipe } from './pipes/order-other.pipe';
import { SelectRecordTypePipe } from './pipes/select-record-type.pipe';
import { WorkerDaysPipe } from './pipes/worker-days.pipe';
import { WorkerPayPipe } from './pipes/worker-pay.pipe';
import { WorkplacePermissionsBearerPipe } from './pipes/workplace-permissions-bearer.pipe';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, RouterModule, OverlayModule],
  declarations: [
    AbsoluteNumberPipe,
    AlertComponent,
    AutoSuggestComponent,
    BackLinkComponent,
    BasicRecordComponent,
    BreadcrumbsComponent,
    ChangeDataOwnerDialogComponent,
    CancelDataOwnerDialogComponent,
    CharacterCountComponent,
    ClosedEndedAnswerPipe,
    DataViewPermissionsPipe,
    SelectRecordTypePipe,
    DatePickerComponent,
    DetailsComponent,
    EligibilityIconComponent,
    EmploymentComponent,
    ErrorSummaryComponent,
    FileValueAccessorDirective,
    BulkUploadFileTypePipePipe,
    WhyCollectingFluJabComponent,
    InsetTextComponent,
    MessagesComponent,
    NumericAnswerPipe,
    NursingCategoriesTextPipe,
    NursingSpecialismsTextPipe,
    OpenEndedAnswerPipe,
    OrderOtherPipe,
    PanelComponent,
    PersonalDetailsComponent,
    PhaseBannerComponent,
    ProgressComponent,
    QualificationsAndTrainingComponent,
    StaffRecordsTabComponent,
    StaffRecordSummaryComponent,
    StaffSummaryComponent,
    StatusComponent,
    SubmitButtonComponent,
    SubmitExitButtonsComponent,
    SummaryListComponent,
    SummaryRecordChangeComponent,
    SummaryRecordValueComponent,
    TabComponent,
    TabsComponent,
    TrainingLinkPanelComponent,
    TotalStaffPanelComponent,
    UserAccountsSummaryComponent,
    WdfConfirmationPanelComponent,
    WorkerDaysPipe,
    WorkerPayPipe,
    WorkplacePermissionsBearerPipe,
    WorkplaceSummaryComponent,
    WorkplaceTabComponent,
    OrderOtherPipe,
    LongDatePipe,
    RejectRequestDialogComponent,
    SetDataPermissionDialogComponent,
    TrainingAndQualificationsCategoriesComponent,
    TrainingAndQualificationsTabComponent,
    TrainingAndQualificationsSummaryComponent,
    TrainingInfoPanelComponent,
    LinkToParentDialogComponent,
    LinkToParentCancelDialogComponent,
    LinkToParentRemoveDialogComponent,
    BecomeAParentDialogComponent,
    OwnershipChangeMessageDialogComponent,
    DeleteWorkplaceDialogComponent,
    ParentConfirmationDialogComponent,
    CqcConfirmationDialogComponent,
    TotalStaffComponent,
    MoveWorkplaceDialogComponent,
    WdfFieldConfirmationComponent,
    WdfStaffMismatchMessageComponent,
    CheckCQCDetailsComponent,
    PageNotFoundComponent,
    ArticleListComponent,
    PageComponent,
    FirstErrorPipe,
    ReviewCheckboxComponent,
  ],
  exports: [
    AlertComponent,
    AutoSuggestComponent,
    BackLinkComponent,
    BasicRecordComponent,
    BreadcrumbsComponent,
    ChangeDataOwnerDialogComponent,
    CancelDataOwnerDialogComponent,
    CharacterCountComponent,
    ClosedEndedAnswerPipe,
    DataViewPermissionsPipe,
    SelectRecordTypePipe,
    DatePickerComponent,
    DetailsComponent,
    EligibilityIconComponent,
    EmploymentComponent,
    ErrorSummaryComponent,
    FileValueAccessorDirective,
    WhyCollectingFluJabComponent,
    InsetTextComponent,
    MessagesComponent,
    NumericAnswerPipe,
    NursingCategoriesTextPipe,
    NursingSpecialismsTextPipe,
    OpenEndedAnswerPipe,
    OrderOtherPipe,
    PanelComponent,
    PersonalDetailsComponent,
    PhaseBannerComponent,
    ProgressComponent,
    QualificationsAndTrainingComponent,
    StaffRecordsTabComponent,
    StaffRecordSummaryComponent,
    StaffSummaryComponent,
    StatusComponent,
    SubmitButtonComponent,
    SubmitExitButtonsComponent,
    SummaryListComponent,
    SummaryRecordValueComponent,
    TabComponent,
    TabsComponent,
    TotalStaffPanelComponent,
    UserAccountsSummaryComponent,
    WdfConfirmationPanelComponent,
    WorkerDaysPipe,
    WorkerPayPipe,
    WorkplacePermissionsBearerPipe,
    WorkplaceSummaryComponent,
    WorkplaceTabComponent,
    OrderOtherPipe,
    TrainingLinkPanelComponent,
    LongDatePipe,
    RejectRequestDialogComponent,
    SetDataPermissionDialogComponent,
    TrainingAndQualificationsCategoriesComponent,
    TrainingAndQualificationsTabComponent,
    TrainingAndQualificationsSummaryComponent,
    TrainingInfoPanelComponent,
    LinkToParentDialogComponent,
    LinkToParentCancelDialogComponent,
    LinkToParentRemoveDialogComponent,
    BecomeAParentDialogComponent,
    OwnershipChangeMessageDialogComponent,
    DeleteWorkplaceDialogComponent,
    ParentConfirmationDialogComponent,
    CqcConfirmationDialogComponent,
    TotalStaffComponent,
    BulkUploadFileTypePipePipe,
    MoveWorkplaceDialogComponent,
    CheckCQCDetailsComponent,
    PageNotFoundComponent,
    ArticleListComponent,
    PageComponent,
    FirstErrorPipe,
    ReviewCheckboxComponent,
  ],
  providers: [DialogService, TotalStaffComponent, ArticleListResolver],
})
export class SharedModule {}
