import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { take } from 'rxjs/operators';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
})
export class SearchComponent implements OnInit {
  public results = [];
  public registrations = [];
  public selectedWorkplaceUid: string;
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
    locationid: '',
    errors: [],
  };

  constructor(
    private router: Router,
    protected backService: BackService,
    private http: HttpClient,
    private establishmentService: EstablishmentService,
    private authService: AuthService,
    private permissionsService: PermissionsService,
    private notificationsService: NotificationsService,
    private userService: UserService,
    private registrationsService: RegistrationsService
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
      this.form.nameLabel = 'Workplace ID';
      this.form.subTitle = 'Establishment Search';
      this.form.title = 'Define your search criteria';
      this.form.buttonText = 'Search Establishments';
    } else {
      this.form.type = 'registrations';
    }
    this.getRegistrations();
  }

  public getRegistrations() {
    this.registrationsService.getRegistrations().subscribe(
      data => {
        this.registrations = data;
      },
      error => this.onError(error)
    );
  }

  public searchType(data, type) {
    return this.http.post<any>('/api/admin/search/' + type, data, { observe: 'response' });
  }

  public getNewEstablishmentId(id, username) {
    let data = {
      username: username,
    };
    return this.http.post<any>('/api/user/swap/establishment/' + id, data, { observe: 'response' });
  }

  public setEsblishmentId(id, username, e): void {
    e.preventDefault();
    this.getNewEstablishmentId(id, username).subscribe(
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
    if (this.form.username.length === 0 && this.form.name.length === 0 && this.form.locationid.length === 0) {
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
          locationid: this.form.locationid,
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
        .subscribe(
          workplace => {
            this.notificationsService.getAllNotifications().subscribe(notify => {
              this.notificationsService.notifications$.next(notify);
              this.establishmentService.setState(workplace);
              this.establishmentService.setPrimaryWorkplace(workplace);
              this.establishmentService.establishmentId = workplace.uid;
              this.router.navigate(['/dashboard']);
            });
          },
          error => this.onError(error)
        );
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
    this.registrationsService.userApproval(data).subscribe();
  }
}
