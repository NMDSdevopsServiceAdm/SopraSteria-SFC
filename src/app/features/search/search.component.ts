import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

export interface Registrations {
  [index: number]: {
    name: string;
    username: string;
    securityQuestion: string;
    securityQuestionAnswer: string;
    email: string;
    phone: string;
    created: string;
    establishment: {
      name: string;
      isRegulated: boolean;
      nmdsId: string;
      address: string;
      address2: string;
      address3: string;
      postcode: string;
      town: string;
      county: string;
      locationId: string;
      provid: string;
      mainService: number;
    };
  };
}
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
})
export class SearchComponent implements OnInit {
  public results = [];
  public registrations = [];
  public form = {
    type: '',
    title: '',
    subTitle: '',
    buttonText: '',
    valid: true,
    submitted: false,
    username: '',
    usernameLabel: '',
    name: '',
    nameLabel: '',
    errors: [],
  };

  constructor(
    private router: Router,
    protected backService: BackService,
    private http: HttpClient,
    private establishmentService: EstablishmentService,
    private authService: AuthService,
    private permissionsService: PermissionsService
  ) {}

  ngOnInit() {
    this.setBackLink();

    if (this.router.url === '/search-users') {
      this.form.type = 'users';
      this.form.usernameLabel = 'Username';
      this.form.nameLabel = 'Name';
      this.form.subTitle = 'User Search';
      this.form.title = 'Define your search criteria';
      this.form.buttonText = 'Search Users';
    } else if (this.router.url === '/search-establishments') {
      this.form.type = 'establishments';
      this.form.usernameLabel = 'Postcode';
      this.form.nameLabel = 'NDMS ID';
      this.form.subTitle = 'Establishment Search';
      this.form.title = 'Define your search criteria';
      this.form.buttonText = 'Search Establishments';
    } else {
      this.form.type = 'registrations';
    }
    this.getRegistrations().subscribe(
      data => {
        this.registrations = data;
      },
      error => this.onError(error)
    );
  }

  public getRegistrations(): Observable<Registrations[]> {
    return this.http.get<Registrations[]>('/api/admin/registrations/');
  }

  public userApproval(data: object) {
    console.log('We are about to query the API');
    return this.http.post<any>('/api/admin/approval/', data);
  }

  public searchType(data, type) {
    return this.http.post<any>('/api/admin/search/' + type, data, { observe: 'response' });
  }

  public getNewEstablishmentId(id) {
    return this.http.post<any>('/api/user/swap/establishment/' + id, null, { observe: 'response' });
  }

  public setEsblishmentId(id, e): void {
    e.preventDefault();
    this.getNewEstablishmentId(id).subscribe(
      data => {
        this.permissionsService.clearPermissions();
        this.onSwapSuccess(data);
      },
      error => this.onError(error)
    );
  }

  public onSubmit(): void {
    this.form.errors = [];
    this.form.submitted = true;
    // this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.username.length === 0 && this.form.name.length === 0) {
      this.form.errors.push({
        error: 'Please enter at least 1 search value',
        id: 'username',
      });
      this.form.submitted = false;
    } else {
      let data = {};

      if (this.form.type === 'users') {
        data = {
          username: this.form.username,
          name: this.form.name,
        };
      } else {
        data = {
          postcode: this.form.username,
          nmdsId: this.form.name,
        };
      }

      this.searchType(data, this.form.type).subscribe(
        response => this.onSuccess(response),
        error => this.onError(error)
      );
    }
  }

  private onSuccess(data) {
    this.results = data.body;
  }

  private onSwapSuccess(data) {
    if (data.body && data.body.establishment && data.body.establishment.uid) {
      this.authService.token = data.headers.get('authorization');

      const workplaceUid = data.body.establishment.uid;

      this.establishmentService
        .getEstablishment(workplaceUid)
        .pipe(take(1))
        .subscribe(workplace => {
          this.establishmentService.setState(workplace);
          this.establishmentService.setPrimaryWorkplace(workplace);
          this.establishmentService.establishmentId = workplace.uid;
          this.router.navigate(['/dashboard']);
        });
    }
  }

  private onError(error) {}

  protected setBackLink(): void {
    this.backService.setBackLink({ url: ['/dashboard'] });
  }

  public approveUser(username: string, approved: boolean, index: number) {
    const data = {
      username,
      approve: approved,
    };
    this.registrations.splice(index, 1);
    this.userApproval(data).subscribe();
  }
}
