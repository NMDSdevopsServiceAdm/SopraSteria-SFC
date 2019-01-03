import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms"
import { Router } from "@angular/router"

import { MessageService } from "../../core/services/message.service"

import { FeedbackService } from "../../core/services/feedback.service"
import { FeedbackModel } from '../../core/model/feedback.model';


@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit, OnDestroy {
  private _feedback: FeedbackModel = null;
  private _pendingFeedback: boolean = true;

  constructor(
    private router: Router,
    private feedbackService: FeedbackService,
    private messageService: MessageService,
    private fb: FormBuilder) {

  }

  private feedbackForm: FormGroup
  private subscriptions = []

  private _countdownValidation = {
    whenDoingCtl : {
      max: 500,
      current: 0,
      remaining: 500 },
    tellUsCtl : {
      max: 400,
      current: 0,
      remaining: 400
    }
  };

  private validateCountdown(control: string): void {
    (this._countdownValidation[control]).current = this.feedbackForm.get(control).value.toString().length;
    (this._countdownValidation[control]).remaining = (this._countdownValidation[control]).max - (this._countdownValidation[control]).current;
  }

  private countdown(control: string): number {
    return (this._countdownValidation[control]).remaining;
  };

  private countdownWhenDoing(): number {
    return this.countdown('whenDoingCtl');
  }
  private countdownTellUs(): number {
    return this.countdown('tellUsCtl');
  }

  // form controls
  get tellUscontrol() : string {
    return this.feedbackForm.get('tellUsCtl').value
  }
  get whenDoingControl() : string {
    return this.feedbackForm.get('whenDoingCtl').value;
  }
  get nameControl(): string {
    return this.feedbackForm.get('nameCtl').value;
  }
  get emailControl() : string {
    return this.feedbackForm.get('emailCtl').value;
  }

  get pendingFeedback() : boolean {
    return this._pendingFeedback;
  }
  resetPendingFeedback() {
    this._pendingFeedback = false;
  }

  closeWindow() {
    // close the window
    this.feedbackService.window.close();
  }

  onSubmit () {
    console.log("Feedback when doing form errors: ", this.feedbackForm.get('whenDoingCtl').errors)

    return;

    if (this.feedbackForm.valid) {
      if (this.pendingFeedback) {
        // not yet submitted feedback, so post feedback
        this._feedback = {
          doingWhat: this.whenDoingControl,
          tellUs: this.tellUscontrol,
          name: this.nameControl,
          email: this.emailControl,
        };
  
        this.subscriptions.push(
          this.feedbackService.post(this._feedback)
          .subscribe(() => {
            this.resetPendingFeedback();
          })
        );
      }
    }
  }

  ngOnInit() {
    // create form controls, including an empty array for the list of authorities
    // all form controls are empty 
    this.feedbackForm = this.fb.group({
      tellUsCtl: ['', [Validators.required, Validators.maxLength(500)]],
      whenDoingCtl: ['', [Validators.required, Validators.maxLength(500)]],
      nameCtl: ['', [Validators.maxLength(120)]],
      emailCtl: ['', [Validators.maxLength(120)]],
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.messageService.clearAll()
  }
}
