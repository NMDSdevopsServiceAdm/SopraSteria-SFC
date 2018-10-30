import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-cqc-registered-question',
  templateUrl: './cqc-registered-question.component.html',
  styleUrls: ['./cqc-registered-question.component.scss']
})
export class CqcRegisteredQuestionComponent implements OnInit {

  cqcRegisteredQuestionForm: FormGroup;
  regQuestionMethod = {
    type: '',
    location: '',
    emailAddress: ''
  };

  constructor() { }

  ngOnInit() {

    // Email address and phone number should not have validation by default as it is dependent on what the user picks
    // Full name regex should allow for foreign letters
    this.cqcRegisteredQuestionForm = new FormGroup({
      regQuestionMethod: new FormControl('', { updateOn: 'change', validators: Validators.required })
      //emailAddress: new FormControl(''),
      //phoneNumber: new FormControl('')
    }, { updateOn: 'blur' });

  }

  // Function to change the validation on email address and phone number depending on what the user picked for contact method
  regQuestionMethodChanged(regQuestionMethod) {
    console.log(regQuestionMethod);
  }

}
