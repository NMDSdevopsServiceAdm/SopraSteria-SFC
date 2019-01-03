import { Component, OnInit, OnDestroy } from '@angular/core';

import { FeedbackService } from "../../core/services/feedback.service"


@Component({
  selector: 'app-contactUs',
  templateUrl: './contactUs.component.html',
  styleUrls: ['./contactUs.component.scss']
})
export class ContactUsComponent implements OnInit, OnDestroy {
  
  constructor(
    private feedbackService: FeedbackService,
  ) {
  }

  private subscriptions = []

  closeWindow() {
    // close the window
    this.feedbackService.window.close();
  }

  onSubmit () {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }
}
