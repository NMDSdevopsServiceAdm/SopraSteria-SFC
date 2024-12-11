import { Component, ElementRef, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ErrorDetails } from '@core/model/errorSummary.model';

@Component({
  selector: 'app-find-username',
  templateUrl: './find-username.component.html',
})
export class FindUsernameComponent {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public submitted = false;
  public formErrorsMap: Array<ErrorDetails>;
}
