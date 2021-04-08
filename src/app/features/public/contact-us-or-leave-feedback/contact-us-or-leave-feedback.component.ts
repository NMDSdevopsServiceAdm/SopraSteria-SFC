import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact-us-or-leave-feedback',
  templateUrl: './contact-us-or-leave-feedback.component.html',
})
export class ContactUsOrLeaveFeedbackComponent {
  public form: FormGroup;

  constructor(protected formBuilder: FormBuilder, protected router: Router) {
    this.form = this.formBuilder.group({
      contactUsOrFeedback: [null, Validators.required],
    });
  }

  get contactUsOrFeedback() {
    return this.form.get('contactUsOrFeedback').value;
  }

  continue() {
    console.log(this.contactUsOrFeedback);
    if (this.contactUsOrFeedback === 'feedback') {
      this.router.navigate(['/feedback']);
    } else if (this.contactUsOrFeedback === 'contactUs') {
      this.router.navigate(['/contact-us']);
    }
  }
}
