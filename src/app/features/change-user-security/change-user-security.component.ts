import { Component, OnInit, OnDestroy } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { UserService } from '../../core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-change-user-security',
  templateUrl: './change-user-security.component.html'
})
export class ChangeUserSecurityComponent implements OnInit, OnDestroy {
  public changeUserSecurityForm: FormGroup;
  public displayError: boolean;
  public submitted: boolean;
  public userDetails: {};

  private username: string;
  private uid: string;
  private securityQuestion: string;
  private securityAnswer: string;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private _userService: UserService
  ) { }

  // Get Security Question
  get getSecurityQuestionInput() {
    return this.changeUserSecurityForm.get('securityQuestionInput');
  }

  // Get Security Answer
  get getSecurityAnswerInput() {
    return this.changeUserSecurityForm.get('securityAnswerInput');
  }

  ngOnInit() {
    this.changeUserSecurityForm = this.fb.group({
      securityQuestionInput: ['', [Validators.required, Validators.maxLength(255)]],
      securityAnswerInput: ['', [Validators.required, Validators.maxLength(255)]]
    });

    this._userService.userDetails$.subscribe(userDetails => this.userDetails = userDetails);

    this.setUserDetails();

    this.displayError = false;
    this.submitted = false;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  setUserDetails() {
    if (this.userDetails) {

      this.username = this.userDetails['username'];
      this.uid = this.userDetails['uid'];

      this.securityQuestion = this.userDetails['securityQuestion'];
      this.securityAnswer = this.userDetails['securityQuestionAnswer'];

      this.changeUserSecurityForm.setValue({
        'securityQuestionInput': this.securityQuestion,
        'securityAnswerInput': this.securityAnswer
      });
    }
  }

  changeUserDetails(data) {
    this.subscriptions.add(
      this._userService.updateUserDetails(this.username, data).subscribe(res => {
        this.submitted = true;
        this.router.navigate(['/change-user-summary']);
      })
    );
  }

  onSubmit() {
    if (this.changeUserSecurityForm.invalid) {
      this.displayError = true;
    }
    else {
      const data = {
        securityQuestion: this.changeUserSecurityForm.value.securityQuestionInput,
        securityQuestionAnswer: this.changeUserSecurityForm.value.securityAnswerInput
      };
      this.changeUserDetails(data);
    }
  }

}
