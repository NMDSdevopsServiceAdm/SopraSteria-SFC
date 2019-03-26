import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FeedbackModel } from '@core/model/feedback.model';
import { FeedbackService } from '@core/services/feedback.service';
import { WindowRef } from '@core/services/window.ref';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
})
export class FeedbackComponent implements OnInit, OnDestroy {
  private _pendingFeedback = true;
  private form: FormGroup;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private feedbackService: FeedbackService,
    private formBuilder: FormBuilder,
    private windowRef: WindowRef
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      tellUs: [null, [Validators.required, Validators.maxLength(500)]],
      doingWhat: [null, [Validators.required, Validators.maxLength(500)]],
      fullname: [null, [Validators.maxLength(120)]],
      email: [null, [Validators.email, Validators.maxLength(120)]],
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
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
