import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AutoSuggestComponent } from './components/auto-suggest/auto-suggest.component';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { DetailsComponent } from './components/details/details.component';
import { ErrorSummaryComponent } from './components/error-summary/error-summary.component';
import { MessagesComponent } from './components/messages/messages.component';
import { PanelComponent } from './components/panel/panel.component';
import { StartButtonComponent } from './components/start-button/start-button.component';
import { StatusComponent } from './components/status/status.component';
import { SubmitButtonComponent } from './components/submit-button/submit-button.component';
import { TabComponent } from './components/tabs/tab.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { NumberDigitsMax } from './directives/number-digits-max.directive';
import { NumberIntOnly } from './directives/number-int-only.directive';
import { NumberMax } from './directives/number-max.directive';
import { NumberPositiveOnly } from './directives/number-positive-only.directive';
import { Number } from './directives/number.directive';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  declarations: [
    AutoSuggestComponent,
    DatePickerComponent,
    DetailsComponent,
    ErrorSummaryComponent,
    MessagesComponent,
    PanelComponent,
    StartButtonComponent,
    SubmitButtonComponent,
    NumberDigitsMax,
    NumberIntOnly,
    NumberMax,
    NumberPositiveOnly,
    Number,
    StatusComponent,
    TabComponent,
    TabsComponent,
  ],
  exports: [
    AutoSuggestComponent,
    DatePickerComponent,
    DetailsComponent,
    ErrorSummaryComponent,
    MessagesComponent,
    PanelComponent,
    StartButtonComponent,
    SubmitButtonComponent,
    NumberDigitsMax,
    NumberIntOnly,
    NumberMax,
    NumberPositiveOnly,
    Number,
    StatusComponent,
    TabComponent,
    TabsComponent,
  ],
})
export class SharedModule {}
