import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AutoSuggestComponent } from './components/auto-suggest/auto-suggest.component';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { DetailsComponent } from './components/details/details.component';
import { MessagesComponent } from './components/messages/messages.component';
import { SubmitButtonComponent } from './components/submit-button/submit-button.component';
import { NumberDigitsMax } from './directives/number-digits-max.directive';
import { NumberMax } from './directives/number-max.directive';
import { NumberPositiveOnly } from './directives/number-positive-only.directive';
import { Number } from './directives/number.directive';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule],
  declarations: [
    AutoSuggestComponent,
    DatePickerComponent,
    DetailsComponent,
    MessagesComponent,
    SubmitButtonComponent,
    NumberDigitsMax,
    NumberMax,
    NumberPositiveOnly,
    Number,
  ],
  exports: [
    AutoSuggestComponent,
    DatePickerComponent,
    DetailsComponent,
    MessagesComponent,
    SubmitButtonComponent,
    NumberDigitsMax,
    NumberMax,
    NumberPositiveOnly,
    Number,
  ],
})
export class SharedModule {}
