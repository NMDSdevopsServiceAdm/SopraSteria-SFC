import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-search-for-user',
  templateUrl: './search-for-user.component.html',
})
export class SearchForUserComponent implements OnInit {
  public form: FormGroup;
  public results: any;

  constructor(private formBuilder: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: null,
      username: null,
      emailAddress: null,
    });
  }

  public searchUsers(data: UserSearchRequest): any {
    return this.http.post<any>('/api/admin/search/users', data, { observe: 'response' });
  }

  public onSubmit(): void {
    const data = this.getRequestData();
    this.searchUsers(data).subscribe((response) => (this.results = response.body));
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
