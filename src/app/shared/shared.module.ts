import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DashboardHeaderComponent } from '@shared/components/dashboard-header/dashboard-header.component';

import { AutoSuggestComponent } from './components/auto-suggest/auto-suggest.component';
import { BackLinkComponent } from './components/back-link/back-link.component';
import { CharacterCountComponent } from './components/character-count/character-count.component';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { DetailsComponent } from './components/details/details.component';
import { ErrorSummaryComponent } from './components/error-summary/error-summary.component';
import { InsetTextComponent } from './components/inset-text/inset-text.component';
import { MessagesComponent } from './components/messages/messages.component';
import { PanelComponent } from './components/panel/panel.component';
import { PhaseBannerComponent } from './components/phase-banner/phase-banner.component';
import { SkipLinkComponent } from './components/skip-link/skip-link.component';
import { StartButtonComponent } from './components/start-button/start-button.component';
import { StatusComponent } from './components/status/status.component';
import { SubmitButtonComponent } from './components/submit-button/submit-button.component';
import { TabComponent } from './components/tabs/tab.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { TotalStaffPanelComponent } from './components/total-staff-panel/total-staff-panel.component';
import { WorkplaceSummaryComponent } from './components/workplace-summary/workplace-summary.component';
import { NumberDigitsMax } from './directives/number-digits-max.directive';
import { NumberIntOnly } from './directives/number-int-only.directive';
import { NumberMax } from './directives/number-max.directive';
import { NumberPositiveOnly } from './directives/number-positive-only.directive';
import { Number } from './directives/number.directive';
import { AbsoluteNumberPipe } from './pipes/absolute-number.pipe';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  declarations: [
    AbsoluteNumberPipe,
    AutoSuggestComponent,
    BackLinkComponent,
    CharacterCountComponent,
    DashboardHeaderComponent,
    DatePickerComponent,
    DetailsComponent,
    ErrorSummaryComponent,
    InsetTextComponent,
    MessagesComponent,
    Number,
    NumberDigitsMax,
    NumberIntOnly,
    NumberMax,
    NumberPositiveOnly,
    PanelComponent,
    PhaseBannerComponent,
    StartButtonComponent,
    StatusComponent,
    SubmitButtonComponent,
    TabComponent,
    TabsComponent,
    TotalStaffPanelComponent,
    WorkplaceSummaryComponent,
    SkipLinkComponent,
  ],
  exports: [
    AutoSuggestComponent,
    BackLinkComponent,
    CharacterCountComponent,
    DashboardHeaderComponent,
    DatePickerComponent,
    DetailsComponent,
    ErrorSummaryComponent,
    InsetTextComponent,
    MessagesComponent,
    Number,
    NumberDigitsMax,
    NumberIntOnly,
    NumberMax,
    NumberPositiveOnly,
    PanelComponent,
    PhaseBannerComponent,
    StartButtonComponent,
    StatusComponent,
    SubmitButtonComponent,
    TabComponent,
    TabsComponent,
    TotalStaffPanelComponent,
    WorkplaceSummaryComponent,
    SkipLinkComponent,
  ],
})
export class SharedModule {}
