import { Subscription } from 'rxjs';

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
  @ViewChild('securityQuestionEl') securityQuestionEl: ElementRef;

  public form: UntypedFormGroup;
  public submitted = false;
  public formErrorsMap: Array<ErrorDetails>;
  public errorMessage = 'Enter the answer to your security question';

  private subscriptions = new Subscription();

  constructor(
    private FormBuilder: UntypedFormBuilder,
    private errorSummaryService: ErrorSummaryService,
    private findUsernameService: FindUsernameService,
  ) {}

  ngOnInit(): void {
    this.form = this.FormBuilder.group({
      securityQuestionAnswer: ['', { validators: [Validators.required], updateOn: 'submit' }],
    });
    this.setupFormErrorsMap();
    this.setCurrentForm.emit(this);
    this.focusOnQuestion();
  }

  public focusOnQuestion() {
    setTimeout(() => {
      this.securityQuestionEl.nativeElement.focus();
    }, 0);
  }
  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'securityQuestionAnswer',
        type: [
          {
            name: 'required',
            message: this.errorMessage,
          },
        ],
      },
    ];
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  public onSubmit(): void {
    this.submitted = true;

    if (!this.form.valid) {
      return;
    }

    const params = {
      uid: this.accountUid,
      securityQuestionAnswer: this.form.get('securityQuestionAnswer').value,
    };

    this.subscriptions.add(
      this.findUsernameService.findUsername(params).subscribe((res) => {
        console.log(res);
      }),
    );
  }
}
