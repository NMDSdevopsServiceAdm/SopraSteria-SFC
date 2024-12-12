import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FindUsernameService } from '@core/services/find-username.service';

@Component({
  selector: 'app-find-username',
  templateUrl: './find-username.component.html',
  styleUrls: ['./find-username.component.scss'],
})
export class FindUsernameComponent implements OnInit {
  @Input() accountUid: string;
  @Input() securityQuestion: string;

  @Output() setCurrentForm = new EventEmitter<FindUsernameComponent>();

  @ViewChild('formEl') formEl: ElementRef;

  public form: UntypedFormGroup;
  public submitted = false;
  public formErrorsMap: Array<ErrorDetails>;

  constructor(
    private FormBuilder: UntypedFormBuilder,
    private errorSummaryService: ErrorSummaryService,
    private findUsernameService: FindUsernameService,
  ) {}

  ngOnInit(): void {
    this.form = this.FormBuilder.group({
      securityQuestionAnswer: [Validators.required],
    });
    this.setupFormErrorsMap();
    this.setCurrentForm.emit(this);
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  public setupFormErrorsMap(): void {}

  public onSubmit(): void {}
}
