import { Subscription } from 'rxjs';

import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FindUsernameResponse, FindUsernameService } from '@core/services/find-username.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-find-username',
    templateUrl: './find-username.component.html',
    styleUrls: ['./find-username.component.scss'],
    standalone: false
})
export class FindUsernameComponent implements OnInit, OnDestroy {
  @Input() accountUid: string;
  @Input() securityQuestion: string;

  @Output() setCurrentForm = new EventEmitter<FindUsernameComponent>();

  @ViewChild('formEl') formEl: ElementRef;
  @ViewChild('securityQuestionEl') securityQuestionEl: ElementRef;

  public form: UntypedFormGroup;
  public submitted = false;
  public formErrorsMap: Array<ErrorDetails>;
  public requiredErrorMessage = 'Enter the answer to your security question';
  public remainingAttempts: number;
  public serverError: string;

  private subscriptions = new Subscription();

  constructor(
    private FormBuilder: UntypedFormBuilder,
    private errorSummaryService: ErrorSummaryService,
    private findUsernameService: FindUsernameService,
    private router: Router,
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
    this.securityQuestionEl.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      this.securityQuestionEl.nativeElement.focus();
    }, 500);
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'securityQuestionAnswer',
        type: [
          {
            name: 'required',
            message: this.requiredErrorMessage,
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
        this.handleResponse(res);
      }),
    );
  }

  public handleResponse(response: FindUsernameResponse) {
    switch (response.answerCorrect) {
      case true: {
        this.findUsernameService.usernameFound = response.username;
        this.router.navigate(['/username-found']);
        break;
      }
      case false: {
        this.remainingAttempts = response.remainingAttempts;

        if (this.remainingAttempts === 0) {
          this.router.navigate(['/security-question-answer-not-match']);
        }
        break;
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
