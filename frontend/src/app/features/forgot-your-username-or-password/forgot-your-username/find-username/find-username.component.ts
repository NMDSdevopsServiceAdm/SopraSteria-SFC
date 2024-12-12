import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ErrorDetails } from '@core/model/errorSummary.model';

@Component({
  selector: 'app-find-username',
  templateUrl: './find-username.component.html',
})
export class FindUsernameComponent implements OnInit {
  @Input() accountUid: string;
  @Input() securityQuestion: string;

  @Output() setCurrentForm = new EventEmitter<FindUsernameComponent>();

  @ViewChild('formEl') formEl: ElementRef;

  public form: UntypedFormGroup;
  public submitted = false;
  public formErrorsMap: Array<ErrorDetails>;

  ngOnInit(): void {
    this.setCurrentForm.emit(this);
  }
}
