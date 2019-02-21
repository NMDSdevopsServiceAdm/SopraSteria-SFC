import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AutoSuggestComponent } from './components/auto-suggest/auto-suggest.component';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { DetailsComponent } from './components/details/details.component';
import { MessagesComponent } from './components/messages/messages.component';
import { SubmitButtonComponent } from './components/submit-button/submit-button.component';
import { Number } from './directives/number.directive';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule],
  declarations: [
    AutoSuggestComponent,
    DatePickerComponent,
    DetailsComponent,
    MessagesComponent,
    SubmitButtonComponent,
    Number,
  ],
  exports: [
    AutoSuggestComponent,
    DatePickerComponent,
    DetailsComponent,
    MessagesComponent,
    SubmitButtonComponent,
    Number,
  ],
})
export class SharedModule {}
