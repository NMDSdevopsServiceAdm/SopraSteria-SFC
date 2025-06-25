import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CannotCreateAccountComponent } from '@core/components/error/cannot-create-account/cannot-create-account.component';
import { PageNoLongerAvailableComponent } from '@core/components/error/page-no-longer-available/page-no-longer-available.component';
import { PageNotFoundComponent } from '@core/components/error/page-not-found/page-not-found.component';
import { ArticleListResolver } from '@core/resolvers/article-list.resolver';
import { FeatureFlagsResolver } from '@core/resolvers/feature-flags.resolver';
import { QuestionsAndAnswersResolver } from '@core/resolvers/help/questions-and-answers/questions-and-answers.resolver';
import { PageResolver } from '@core/resolvers/page.resolver';
import { DialogService } from '@core/services/dialog.service';
import { ArticleListComponent } from '@features/articles/article-list/article-list.component';
import { NewArticleListComponent } from '@features/articles/new-article-list/new-article-list.component';
import { NewTrainingLinkPanelComponent } from '@features/new-dashboard/training-tab/training-link-panel/training-link-panel.component';
import { MissingMandatoryTrainingComponent } from '@features/training-and-qualifications/new-training-qualifications-record/missing-mandatory-training/missing-mandatory-training.component';
import { DeleteWorkplaceDialogComponent } from '@features/workplace/delete-workplace-dialog/delete-workplace-dialog.component';
import { AlertComponent } from '@shared/components/alert/alert.component';
import { CheckCQCDetailsComponent } from '@shared/components/check-cqc-details/check-cqc-details.component';
import { NewDashboardHeaderComponent } from '@shared/components/new-dashboard-header/dashboard-header.component';
import { SummaryRecordValueComponent } from '@shared/components/summary-record-value/summary-record-value.component';
import { BulkUploadFileTypePipePipe } from '@shared/pipes/bulk-upload-file-type.pipe';
import { SanitizeVideoUrlPipe } from '@shared/pipes/sanitize-video-url.pipe';

import { AccordionGroupComponent } from './components/accordions/generic-accordion/accordion-group/accordion-group.component';
import { AccordionSectionComponent } from './components/accordions/generic-accordion/accordion-section/accordion-section.component';
import { GroupedRadioButtonAccordionComponent } from './components/accordions/radio-button-accordion/grouped-radio-button-accordion/grouped-radio-button-accordion.component';
import { RadioButtonAccordionComponent } from './components/accordions/radio-button-accordion/radio-button-accordion.component';
import { AddNoteComponent } from './components/add-note/add-note.component';
import { AutoSuggestComponent } from './components/auto-suggest/auto-suggest.component';
import { BackLinkComponent } from './components/back-link/back-link.component';
import { BecomeAParentDialogComponent } from './components/become-a-parent/become-a-parent-dialog.component';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { CancelDataOwnerDialogComponent } from './components/cancel-data-owner-dialog/cancel-data-owner-dialog.component';
import { CardComponent } from './components/card/card.component';
import { CertificationsTableComponent } from './components/certifications-table/certifications-table.component';
import { ChangeDataOwnerDialogComponent } from './components/change-data-owner-dialog/change-data-owner-dialog.component';
import { CharacterCountComponent } from './components/character-count/character-count.component';
import { AboutTheDataLinkComponent } from './components/data-area-tab/about-the-data-link/about-the-data-link.component';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { DetailsComponent } from './components/details/details.component';
import { ValidationErrorMessageComponent } from './components/drag-and-drop/validation-error-message/validation-error-message.component';
import { EligibilityIconComponent } from './components/eligibility-icon/eligibility-icon.component';
import { ErrorSummaryComponent } from './components/error-summary/error-summary.component';
import { FundingRequirementsStateComponent } from './components/funding-requirements-state/funding-requirements-state.component';
import { HelpContentComponent } from './components/help-content/help-content.component';
import { InsetTextComponent } from './components/inset-text/inset-text.component';
import { JobRoleNumbersTableComponent } from './components/job-role-numbers-table/job-role-numbers-table.component';
import { LinkToParentCancelDialogComponent } from './components/link-to-parent-cancel/link-to-parent-cancel-dialog.component';
import { LinkToParentRemoveDialogComponent } from './components/link-to-parent-remove/link-to-parent-remove-dialog.component';
import { LinkToParentDialogComponent } from './components/link-to-parent/link-to-parent-dialog.component';
import { LinkWithArrowComponent } from './components/link-with-arrow/link-with-arrow.component';
import { MessagesComponent } from './components/messages/messages.component';
import { MoveWorkplaceDialogComponent } from './components/move-workplace/move-workplace-dialog.component';
import { NavigateToWorkplaceDropdownComponent } from './components/navigate-to-workplace-dropdown/navigate-to-workplace-dropdown.component';
import { NewBackLinkComponent } from './components/new-back-link/new-back-link.component';
import { NewTabsComponent } from './components/new-tabs/new-tabs.component';
import { WDFWorkplaceSummaryComponent } from './components/new-wdf-workplace-summary/wdf-workplace-summary.component';
import { NewWorkplaceSummaryComponent } from './components/new-workplace-summary/workplace-summary.component';
import { NumberInputWithButtonsComponent } from './components/number-input-with-buttons/number-input-with-buttons.component';
import { OtherLinksComponent } from './components/other-links/other-links.component';
import { OwnershipChangeMessageDialogComponent } from './components/ownership-change-message/ownership-change-message-dialog.component';
import { PageComponent } from './components/page/page.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { PanelComponent } from './components/panel/panel.component';
import { PhaseBannerComponent } from './components/phase-banner/phase-banner.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { ProgressComponent } from './components/progress/progress.component';
import { RegistrationSubmitButtonsComponent } from './components/registration-submit-buttons/registration-submit-buttons.component';
import { RejectRequestDialogComponent } from './components/reject-request-dialog/reject-request-dialog.component';
import { RemoveParentConfirmationComponent } from './components/remove-parent-confirmation/remove-parent-confirmation.component';
import { ReviewCheckboxComponent } from './components/review-checkbox/review-checkbox.component';
import { SearchInputComponent } from './components/search-input/search-input.component';
import { SelectUploadCertificateComponent } from './components/select-upload-certificate/select-upload-certificate.component';
import { SelectUploadFileComponent } from './components/select-upload-file/select-upload-file.component';
import { SelectViewPanelComponent } from './components/select-view-panel/select-view-panel.component';
import { SelectWorkplaceDropdownFormComponent } from './components/select-workplace-dropdown-form/select-workplace-dropdown-form.component';
import { SelectWorkplaceRadioButtonFormComponent } from './components/select-workplace-radio-button-form/select-workplace-radio-button-form.component';
import { SetDataPermissionDialogComponent } from './components/set-data-permission/set-data-permission-dialog.component';
import { BasicRecordComponent } from './components/staff-record-summary/basic-record/basic-record.component';
import { EmploymentComponent } from './components/staff-record-summary/employment/employment.component';
import { PersonalDetailsComponent } from './components/staff-record-summary/personal-details/personal-details.component';
import { QualificationsAndTrainingComponent } from './components/staff-record-summary/qualifications-and-training/qualifications-and-training.component';
import { StaffRecordSummaryComponent } from './components/staff-record-summary/staff-record-summary.component';
import { WdfWarningMessageComponent } from './components/staff-record-summary/wdf-warning-message/wdf-warning-message.component';
import { StaffSummaryComponent } from './components/staff-summary/staff-summary.component';
import { StatusComponent } from './components/status/status.component';
import { SubmitButtonComponent } from './components/submit-button/submit-button.component';
import { SubmitExitButtonsComponent } from './components/submit-exit-buttons/submit-exit-buttons.component';
import { SummaryListComponent } from './components/summary-list/summary-list.component';
import { SummaryRecordChangeComponent } from './components/summary-record-change/summary-record-change.component';
import { SummarySectionComponent } from './components/summary-section/summary-section.component';
import { TablePaginationWrapperComponent } from './components/table-pagination-wrapper/table-pagination-wrapper.component';
import { TabComponent } from './components/tabs/tab.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { TotalStaffPanelComponent } from './components/total-staff-panel/total-staff-panel.component';
import { TotalStaffComponent } from './components/total-staff/total-staff.component';
import { TrainingAndQualificationsCategoriesComponent } from './components/training-and-qualifications-categories/training-and-qualifications-categories.component';
import { ViewTrainingComponent } from './components/training-and-qualifications-categories/view-trainings/view-trainings.component';
import { TrainingAndQualificationsSummaryComponent } from './components/training-and-qualifications-summary/training-and-qualifications-summary.component';
import { TrainingInfoPanelComponent } from './components/training-info-panel/training-info-panel.component';
import { TrainingLinkPanelComponent } from './components/training-link-panel/training-link-panel.component';
import { TrainingSelectViewPanelComponent } from './components/training-select-view-panel/training-select-view-panel.component';
import { SelectJobRolesToAddComponent } from './components/update-starters-leavers-vacancies/select-job-roles-to-add/select-job-roles-to-add.component';
import { UpdateLeaversComponent } from './components/update-starters-leavers-vacancies/update-leavers/update-leavers.component';
import { UpdateStartersComponent } from './components/update-starters-leavers-vacancies/update-starters/update-starters.component';
import { UpdateVacanciesComponent } from './components/update-starters-leavers-vacancies/update-vacancies/update-vacancies.component';
import { UserAccountsSummaryComponent } from './components/user-accounts-summary/user-accounts-summary.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { UserTableComponent } from './components/users-table/user.table.component';
import { WdfFieldConfirmationComponent } from './components/wdf-field-confirmation/wdf-field-confirmation.component';
import { WdfStaffMismatchMessageComponent } from './components/wdf-staff-mismatch-message/wdf-staff-mismatch-message.component';
import { WdfSummaryPanel } from './components/wdf-summary-panel/wdf-summary-panel.component';
import { WorkplaceContinueCancelButtonComponent } from './components/workplace-continue-cancel-button.component/workplace-continue-cancel-button.component';
import { WorkplaceNameAddress } from './components/workplace-name-address/workplace-name-address.component';
import { WorkplaceSubmitButtonComponent } from './components/workplace-submit-button/workplace-submit-button.component';
import { WorkplaceSummaryComponent } from './components/workplace-summary/workplace-summary.component';
import { FileValueAccessorDirective } from './form-controls/file-control-value-accessor';
import { AbsoluteNumberPipe } from './pipes/absolute-number.pipe';
import { CareWorkforcePathwayWorkplaceAwarenessTitle } from './pipes/care-workforce-pathway-awareness.pipe';
import { CareWorkforcePathwayRoleCategoryPipe } from './pipes/care-workforce-pathway-role-category.pipe';
import { ClosedEndedAnswerPipe } from './pipes/closed-ended-answer.pipe';
import { DataViewPermissionsPipe } from './pipes/data-view-permissions.pipe';
import { DontKnowPipe } from './pipes/dont-know.pipe';
import { FirstErrorPipe } from './pipes/first-error.pipe';
import { FormatAmpersandPipe } from './pipes/format-ampersand.pipe';
import { FormatCwpUsePipe } from './pipes/format-cwp-use.pipe';
import { FormatStartersLeaversVacanciesPipe } from './pipes/format-starters-leavers-vacancies.pipe';
import { HasValuePipe } from './pipes/has-value.pipe';
import { LongDatePipe } from './pipes/long-date.pipe';
import { NewDataViewPermissionsPipe } from './pipes/new-data-view-permissions.pipe';
import { NumericAnswerPipe } from './pipes/numeric-answer.pipe';
import { NursingCategoriesTextPipe } from './pipes/nursing-categories-text.pipe';
import { NursingSpecialismsTextPipe } from './pipes/nursing-specialisms-text.pipe';
import { OpenEndedAnswerPipe } from './pipes/open-ended-answer.pipe';
import { OrderOtherPipe } from './pipes/order-other.pipe';
import { RemoveTrailingWhitespacePipe } from './pipes/remove-trailing-whitespace.pipe';
import { SelectRecordTypePipe } from './pipes/select-record-type.pipe';
import { ServiceNamePipe } from './pipes/service-name.pipe';
import { WorkerDaysPipe } from './pipes/worker-days.pipe';
import { WorkerPayPipe } from './pipes/worker-pay.pipe';
import { WorkplacePermissionsBearerPipe } from './pipes/workplace-permissions-bearer.pipe';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, OverlayModule],
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
    NewDataViewPermissionsPipe,
    SelectRecordTypePipe,
    DatePickerComponent,
    DetailsComponent,
    EligibilityIconComponent,
    EmploymentComponent,
    ErrorSummaryComponent,
    FileValueAccessorDirective,
    BulkUploadFileTypePipePipe,
    SanitizeVideoUrlPipe,
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
    WorkerDaysPipe,
    WorkerPayPipe,
    WorkplacePermissionsBearerPipe,
    OrderOtherPipe,
    LongDatePipe,
    RejectRequestDialogComponent,
    SetDataPermissionDialogComponent,
    TrainingAndQualificationsCategoriesComponent,
    TrainingAndQualificationsSummaryComponent,
    TrainingInfoPanelComponent,
    LinkToParentDialogComponent,
    LinkToParentCancelDialogComponent,
    LinkToParentRemoveDialogComponent,
    BecomeAParentDialogComponent,
    OwnershipChangeMessageDialogComponent,
    DeleteWorkplaceDialogComponent,
    // ParentConfirmationDialogComponent,
    // CqcConfirmationDialogComponent,
    TotalStaffComponent,
    MoveWorkplaceDialogComponent,
    WdfFieldConfirmationComponent,
    WdfStaffMismatchMessageComponent,
    CheckCQCDetailsComponent,
    PageNotFoundComponent,
    PageNoLongerAvailableComponent,
    ArticleListComponent,
    PageComponent,
    FirstErrorPipe,
    ReviewCheckboxComponent,
    RadioButtonAccordionComponent,
    GroupedRadioButtonAccordionComponent,
    AddNoteComponent,
    PageComponent,
    RemoveParentConfirmationComponent,
    PaginationComponent,
    SearchInputComponent,
    ValidationErrorMessageComponent,
    CannotCreateAccountComponent,
    WorkplaceSubmitButtonComponent,
    UserTableComponent,
    UserFormComponent,
    WorkplaceContinueCancelButtonComponent,
    ProgressBarComponent,
    WorkplaceSummaryComponent,
    SelectWorkplaceRadioButtonFormComponent,
    SelectWorkplaceDropdownFormComponent,
    RegistrationSubmitButtonsComponent,
    NewBackLinkComponent,
    ViewTrainingComponent,
    MissingMandatoryTrainingComponent,
    TrainingSelectViewPanelComponent,
    TablePaginationWrapperComponent,
    DontKnowPipe,
    NewTabsComponent,
    NewWorkplaceSummaryComponent,
    NewArticleListComponent,
    LinkWithArrowComponent,
    WDFWorkplaceSummaryComponent,
    NewDashboardHeaderComponent,
    ServiceNamePipe,
    FormatAmpersandPipe,
    AboutTheDataLinkComponent,
    CardComponent,
    SummarySectionComponent,
    NavigateToWorkplaceDropdownComponent,
    OtherLinksComponent,
    NewTrainingLinkPanelComponent,
    CertificationsTableComponent,
    SelectUploadFileComponent,
    AccordionGroupComponent,
    AccordionSectionComponent,
    FormatStartersLeaversVacanciesPipe,
    SelectUploadCertificateComponent,
    WdfWarningMessageComponent,
    WdfSummaryPanel,
    FundingRequirementsStateComponent,
    SelectViewPanelComponent,
    WorkplaceNameAddress,
    RemoveTrailingWhitespacePipe,
    HelpContentComponent,
    NumberInputWithButtonsComponent,
    UpdateVacanciesComponent,
    UpdateStartersComponent,
    UpdateLeaversComponent,
    SelectJobRolesToAddComponent,
    NumberInputWithButtonsComponent,
    JobRoleNumbersTableComponent,
    CareWorkforcePathwayRoleCategoryPipe,
    HasValuePipe,
    FormatCwpUsePipe,
    CareWorkforcePathwayWorkplaceAwarenessTitle,
  ],
  exports: [
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
    NewDataViewPermissionsPipe,
    SelectRecordTypePipe,
    DatePickerComponent,
    DetailsComponent,
    EligibilityIconComponent,
    EmploymentComponent,
    ErrorSummaryComponent,
    FileValueAccessorDirective,
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
    WorkerDaysPipe,
    WorkerPayPipe,
    WorkplacePermissionsBearerPipe,
    OrderOtherPipe,
    TrainingLinkPanelComponent,
    LongDatePipe,
    RejectRequestDialogComponent,
    SetDataPermissionDialogComponent,
    TrainingAndQualificationsCategoriesComponent,
    TrainingAndQualificationsSummaryComponent,
    TrainingInfoPanelComponent,
    LinkToParentDialogComponent,
    LinkToParentCancelDialogComponent,
    LinkToParentRemoveDialogComponent,
    BecomeAParentDialogComponent,
    OwnershipChangeMessageDialogComponent,
    DeleteWorkplaceDialogComponent,
    // ParentConfirmationDialogComponent,
    // CqcConfirmationDialogComponent,
    TotalStaffComponent,
    BulkUploadFileTypePipePipe,
    SanitizeVideoUrlPipe,
    MoveWorkplaceDialogComponent,
    CheckCQCDetailsComponent,
    PageNotFoundComponent,
    PageNoLongerAvailableComponent,
    ArticleListComponent,
    PageComponent,
    FirstErrorPipe,
    ReviewCheckboxComponent,
    RadioButtonAccordionComponent,
    GroupedRadioButtonAccordionComponent,
    AddNoteComponent,
    PageComponent,
    RemoveParentConfirmationComponent,
    PaginationComponent,
    SearchInputComponent,
    ValidationErrorMessageComponent,
    CannotCreateAccountComponent,
    WorkplaceSubmitButtonComponent,
    UserTableComponent,
    UserFormComponent,
    WorkplaceContinueCancelButtonComponent,
    ProgressBarComponent,
    WorkplaceSummaryComponent,
    SummaryRecordChangeComponent,
    SelectWorkplaceRadioButtonFormComponent,
    SelectWorkplaceDropdownFormComponent,
    RegistrationSubmitButtonsComponent,
    NewBackLinkComponent,
    ViewTrainingComponent,
    MissingMandatoryTrainingComponent,
    TrainingSelectViewPanelComponent,
    TablePaginationWrapperComponent,
    DontKnowPipe,
    NewTabsComponent,
    NewWorkplaceSummaryComponent,
    NewArticleListComponent,
    LinkWithArrowComponent,
    WDFWorkplaceSummaryComponent,
    NewDashboardHeaderComponent,
    ServiceNamePipe,
    FormatAmpersandPipe,
    AboutTheDataLinkComponent,
    CardComponent,
    SummarySectionComponent,
    NavigateToWorkplaceDropdownComponent,
    OtherLinksComponent,
    NewTrainingLinkPanelComponent,
    CertificationsTableComponent,
    SelectUploadFileComponent,
    AccordionGroupComponent,
    AccordionSectionComponent,
    SelectUploadCertificateComponent,
    WdfWarningMessageComponent,
    WdfSummaryPanel,
    FundingRequirementsStateComponent,
    SelectViewPanelComponent,
    WorkplaceNameAddress,
    RemoveTrailingWhitespacePipe,
    HelpContentComponent,
    FormatStartersLeaversVacanciesPipe,
    NumberInputWithButtonsComponent,
    JobRoleNumbersTableComponent,
    CareWorkforcePathwayRoleCategoryPipe,
    HasValuePipe,
    FormatCwpUsePipe,
    CareWorkforcePathwayWorkplaceAwarenessTitle,
  ],
  providers: [
    DialogService,
    TotalStaffComponent,
    ArticleListResolver,
    PageResolver,
    QuestionsAndAnswersResolver,
    FeatureFlagsResolver,
    HasValuePipe,
    FormatCwpUsePipe,
  ],
})
export class SharedModule {}
