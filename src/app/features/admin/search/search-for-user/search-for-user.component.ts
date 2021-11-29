import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';

@Component({
  selector: 'app-search-for-user',
  templateUrl: './search-for-user.component.html',
})
export class SearchForUserComponent implements OnInit {
  public form: FormGroup;
  public results: any;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private switchWorkplaceService: SwitchWorkplaceService,
  ) {}

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

  public navigateToWorkplace(id: string, username: string, nmdsId: string, e: Event): void {
    e.preventDefault();
    this.switchWorkplaceService.navigateToWorkplace(id, username, nmdsId);
  }
}

interface UserSearchRequest {
  username: string;
  name: string;
  emailAddress: string;
}
