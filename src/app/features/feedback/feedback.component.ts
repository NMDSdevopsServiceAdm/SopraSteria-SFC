import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FeedbackModel } from '@core/model/feedback.model';
import { FeedbackService } from '@core/services/feedback.service';
import { MessageService } from '@core/services/message.service';
import { WindowRef } from '@core/services/window.ref';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
})
export class FeedbackComponent implements OnInit, OnDestroy {
  private _feedback: FeedbackModel = null;
  private _pendingFeedback = true;
  private form: FormGroup;
  private subscriptions: Subscription = new Subscription();
  private _countdownValidation = {
    doingWhat: {
      max: 500,
      current: 0,
      remaining: 500,
    },
    tellUs: {
      max: 500,
      current: 0,
      remaining: 500,
    },
  };

  constructor(
    private feedbackService: FeedbackService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private windowRef: WindowRef
  ) {}

  ngOnInit() {
    // create form controls, including an empty array for the list of authorities
    // all form controls are empty
    this.form = this.formBuilder.group({
      tellUs: [null, [Validators.required, Validators.maxLength(500)]],
      doingWhat: [null, [Validators.required, Validators.maxLength(500)]],
      fullname: [null, [Validators.maxLength(120)]],
      email: [null, [Validators.email, Validators.maxLength(120)]],
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.messageService.clearAll();
  }

  private validateCountdown(control: string): void {
    this._countdownValidation[control].current = this.form.get(control).value.toString().length;
    this._countdownValidation[control].remaining =
      this._countdownValidation[control].max - this._countdownValidation[control].current;
  }

  private countdown(control: string): number {
    return this._countdownValidation[control].remaining;
  }

  private countdownWhenDoing(): number {
    return this.countdown('doingWhat');
  }
  private countdownTellUs(): number {
    return this.countdown('tellUs');
  }

  get pendingFeedback(): boolean {
    return this._pendingFeedback;
  }

  resetPendingFeedback() {
    this._pendingFeedback = false;
  }

  closeWindow() {
    this.windowRef.nativeWindow.close();
  }

  onSubmit() {
    if (this.form.valid) {
      if (this.pendingFeedback) {
        const { doingWhat, tellUs, fullname, email } = this.form.controls;
        // not yet submitted feedback, so post feedback
        const request: FeedbackModel = {
          doingWhat: doingWhat.value,
          tellUs: tellUs.value,
          name: fullname.value,
          email: email.value,
        };

        this.subscriptions.add(this.feedbackService.post(request).subscribe(() => this.resetPendingFeedback()));
      }
    }
  }
}
