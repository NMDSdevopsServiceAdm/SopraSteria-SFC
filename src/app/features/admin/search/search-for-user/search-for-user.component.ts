import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-search-for-user',
  templateUrl: './search-for-user.component.html',
})
export class SearchForUserComponent implements OnInit {
  public form: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: null,
      username: null,
      emailAddress: null,
    });
  }

  public searchUsers(data: UserSearchRequest): void {
    console.log(data);
  }

  public onSubmit(): void {
    const data = this.getRequestData();
    this.searchUsers(data);
  }

  private getRequestData(): UserSearchRequest {
    return {
      username: this.form.controls.username.value,
      name: this.form.controls.name.value,
      emailAddress: this.form.controls.emailAddress.value,
    };
  }
}

interface UserSearchRequest {
  username: string;
  name: string;
  emailAddress: string;
}
