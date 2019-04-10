import { Component, OnInit, OnDestroy } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService } from '../../core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-change-user-details',
  templateUrl: './change-user-details.component.html',
})
export class ChangeUserDetailsComponent implements OnInit, OnDestroy {
  public changeUserDetailsForm: FormGroup;
  public displayError: boolean;
  public submitted: boolean;
  public userDetails: {};

  private username: string;
  private uid: string;
  private fullname: string;
  private jobTitle: string;
  private email: string;
  private phone: string;

  private subscriptions: Subscription = new Subscription();

  constructor(private fb: FormBuilder, private router: Router, private _userService: UserService) {}

  // Get fullname
  get getUserFullnameInput() {
    return this.changeUserDetailsForm.get('userFullnameInput');
  }

  // Get job title
  get getUserJobTitle() {
    return this.changeUserDetailsForm.get('userJobTitleInput');
  }

  // Get email
  get getUserEmailInput() {
    return this.changeUserDetailsForm.get('userEmailInput');
  }

  // Get phone
  get getUserPhoneInput() {
    return this.changeUserDetailsForm.get('userPhoneInput');
  }

  ngOnInit() {
    this.changeUserDetailsForm = this.fb.group({
      userFullnameInput: ['', [Validators.required, Validators.maxLength(120)]],
      userJobTitleInput: ['', [Validators.required, Validators.maxLength(120)]],
      userEmailInput: [
        '',
        [
          Validators.required,
          Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,4}$'),
          Validators.maxLength(120),
        ],
      ],
      userPhoneInput: ['', [Validators.required, Validators.pattern('^[0-9 x(?=ext 0-9+)]{8,50}$')]],
    });

    this.subscriptions.add(this._userService.userDetails$.subscribe(userDetails => (this.userDetails = userDetails)));

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

      this.fullname = this.userDetails['fullname'];
      this.jobTitle = this.userDetails['jobTitle'];
      this.email = this.userDetails['email'];
      this.phone = this.userDetails['phone'];

      this.changeUserDetailsForm.setValue({
        userFullnameInput: this.fullname,
        userJobTitleInput: this.jobTitle,
        userEmailInput: this.email,
        userPhoneInput: this.phone,
      });
    }
  }

  changeUserDetails(data) {
    this.subscriptions.add(
      this._userService.updateUserDetails(this.username, data).subscribe(res => {
        this.submitted = true;
        this.router.navigate(['/your-account']);
      })
    );
  }

  onSubmit() {
    if (this.changeUserDetailsForm.invalid) {
      this.displayError = true;
    } else {
      const data = {
        fullname: this.changeUserDetailsForm.value.userFullnameInput,
        jobTitle: this.changeUserDetailsForm.value.userJobTitleInput,
        email: this.changeUserDetailsForm.value.userEmailInput,
        phone: this.changeUserDetailsForm.value.userPhoneInput,
      };
      this.changeUserDetails(data);
    }
  }
}
