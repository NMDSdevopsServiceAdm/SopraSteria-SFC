import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AlertComponent } from '@shared/components/alert/alert.component';

import { AutoSuggestComponent } from './components/auto-suggest/auto-suggest.component';
import { BackLinkComponent } from './components/back-link/back-link.component';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { CharacterCountComponent } from './components/character-count/character-count.component';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { DetailsComponent } from './components/details/details.component';
import { EligibilityIconComponent } from './components/eligibility-icon/eligibility-icon.component';
import { ErrorSummaryComponent } from './components/error-summary/error-summary.component';
import { InsetTextComponent } from './components/inset-text/inset-text.component';
import { MessagesComponent } from './components/messages/messages.component';
import { PanelComponent } from './components/panel/panel.component';
import { PhaseBannerComponent } from './components/phase-banner/phase-banner.component';
import { ProgressComponent } from './components/progress/progress.component';
import { BasicRecordComponent } from './components/staff-record-summary/basic-record/basic-record.component';
import { EmploymentComponent } from './components/staff-record-summary/employment/employment.component';
import { PersonalDetailsComponent } from './components/staff-record-summary/personal-details/personal-details.component';
import {
  QualificationsAndTrainingComponent,
} from './components/staff-record-summary/qualifications-and-training/qualifications-and-training.component';
import { StaffRecordSummaryComponent } from './components/staff-record-summary/staff-record-summary.component';
import { StaffSummaryComponent } from './components/staff-summary/staff-summary.component';
import { StatusComponent } from './components/status/status.component';
import { SubmitButtonComponent } from './components/submit-button/submit-button.component';
import { SummaryListComponent } from './components/summary-list/summary-list.component';
import { TabComponent } from './components/tabs/tab.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { TotalStaffPanelComponent } from './components/total-staff-panel/total-staff-panel.component';
import { UserAccountsSummaryComponent } from './components/user-accounts-summary/user-accounts-summary.component';
import { WorkplaceSummaryComponent } from './components/workplace-summary/workplace-summary.component';
import { FileValueAccessorDirective } from './form-controls/file-control-value-accessor';
import { AbsoluteNumberPipe } from './pipes/absolute-number.pipe';
import { ClosedEndedAnswerPipe } from './pipes/closed-ended-answer.pipe';
import { OpenEndedAnswerPipe } from './pipes/open-ended-answer.pipe';
import { SubmitExitButtonsComponent } from './components/submit-exit-buttons/submit-exit-buttons.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  declarations: [
    AbsoluteNumberPipe,
    AlertComponent,
    AutoSuggestComponent,
    BackLinkComponent,
    BasicRecordComponent,
    BreadcrumbsComponent,
    CharacterCountComponent,
    ClosedEndedAnswerPipe,
    DatePickerComponent,
    DetailsComponent,
    EligibilityIconComponent,
    EmploymentComponent,
    ErrorSummaryComponent,
    FileValueAccessorDirective,
    InsetTextComponent,
    MessagesComponent,
    OpenEndedAnswerPipe,
    PanelComponent,
    PersonalDetailsComponent,
    PhaseBannerComponent,
    ProgressComponent,
    QualificationsAndTrainingComponent,
    StaffRecordSummaryComponent,
    StaffSummaryComponent,
    StatusComponent,
    SubmitButtonComponent,
    TabComponent,
    TabsComponent,
    TotalStaffPanelComponent,
    WorkplaceSummaryComponent,
    SummaryListComponent,
    UserAccountsSummaryComponent,
    SubmitExitButtonsComponent,
  ],
  exports: [
    AlertComponent,
    AutoSuggestComponent,
    BackLinkComponent,
    BasicRecordComponent,
    BreadcrumbsComponent,
    CharacterCountComponent,
    ClosedEndedAnswerPipe,
    DatePickerComponent,
    DetailsComponent,
    EligibilityIconComponent,
    EmploymentComponent,
    ErrorSummaryComponent,
    FileValueAccessorDirective,
    InsetTextComponent,
    MessagesComponent,
    OpenEndedAnswerPipe,
    PanelComponent,
    PersonalDetailsComponent,
    PhaseBannerComponent,
    ProgressComponent,
    QualificationsAndTrainingComponent,
    StaffRecordSummaryComponent,
    StaffSummaryComponent,
    StatusComponent,
    SubmitButtonComponent,
    TabComponent,
    TabsComponent,
    TotalStaffPanelComponent,
    WorkplaceSummaryComponent,
    SummaryListComponent,
    UserAccountsSummaryComponent,
    SubmitExitButtonsComponent,
  ],
})
export class SharedModule {}
