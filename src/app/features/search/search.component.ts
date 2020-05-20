import { Overlay } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { BackService } from '@core/services/back.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import {
  AdminUnlockConfirmationDialogComponent,
} from '@shared/components/link-to-parent-cancel copy/admin-unlock-confirmation';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  providers: [DialogService, AdminUnlockConfirmationDialogComponent, Overlay],
})
export class SearchComponent implements OnInit {
  public results = [];
  public selectedWorkplaceUid: string;
  public notificationData: any;
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
    private dialogService: DialogService
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
    } else if (this.router.url === '/registrations') {
      this.form.type = 'registrations';
    } else {
      this.form.type = 'parent-requests';
    }
  }

  public unlockUser(username: string, index: number, e) {
    e.preventDefault();
    const data = {
      username,
      index,
      removeUnlock: () => {
        this.results[index].isLocked = false;
      }
    }
    this.dialogService.open(AdminUnlockConfirmationDialogComponent, data);
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
  public getAllNotificationWorkplace(nmdsId) {
    return this.http.get<any>(`/api/user/swap/establishment/notification/${nmdsId}`);
  }
  public setEsblishmentId(id, username, nmdsId, e): void {
    e.preventDefault();
    if (!username && nmdsId) {
      this.getAllNotificationWorkplace(nmdsId).subscribe(data => {
        if (data) {
          this.notificationData = data;
        }
      });
    }
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
      this.authService.setPreviousToken();
      this.authService.token = data.headers.get('authorization');
      const workplaceUid = data.body.establishment.uid;
      this.establishmentService
        .getEstablishment(workplaceUid)
        .pipe(take(1))
        .subscribe(
          workplace => {
            this.notificationsService.getAllNotifications().subscribe(notify => {
              this.notificationsService.notifications$.next(this.notificationData ? this.notificationData : notify);
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
}
