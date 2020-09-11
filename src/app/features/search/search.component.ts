import { Overlay } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { BackService } from '@core/services/back.service';
import { DialogService } from '@core/services/dialog.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import {
  AdminUnlockConfirmationDialogComponent,
} from '@shared/components/link-to-parent-cancel copy/admin-unlock-confirmation';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  providers: [DialogService, AdminUnlockConfirmationDialogComponent, Overlay],
})
export class SearchComponent implements OnInit, AfterViewInit {
  public results = [];
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
    employerType: 'All',
    parent: false,
    errors: [],
  };

  public workerDetails = [];
  public workerDetailsLabel = [];

  constructor(
    public router: Router,
    public http: HttpClient,
    public switchWorkplaceService: SwitchWorkplaceService,
    private dialogService: DialogService,
    protected backService: BackService,
    protected authService: AuthService,
  ) {}

  ngAfterViewInit() {
    this.authService.isOnAdminScreen = true;
  }

  ngOnInit() {
    this.setBackLink();

    if (this.router.url === '/search-users') {
      this.form.type = 'users';
      this.form.usernameLabel = 'Username';
      this.form.nameLabel = 'Name';
      this.form.title = 'Search for a user';
      this.form.buttonText = 'Search users';
    } else if (this.router.url === '/search-establishments') {
      this.form.type = 'establishments';
      this.form.usernameLabel = 'Postcode';
      this.form.nameLabel = 'Workplace ID';
      this.form.title = 'Search for a workplace';
      this.form.buttonText = 'Search workplaces';
    } else if (this.router.url === '/search-groups') {
      this.form.type = 'groups';
      this.form.title = 'Search for a group';
      this.form.buttonText = 'Search groups';
    } else if (this.router.url === '/registrations') {
      this.form.type = 'registrations';
    } else if (this.router.url === '/cqc-status-changes') {
      this.form.type = 'cqc-status-changes';
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

  public unlockWorkplaceUser(username: string, workplaceIndex: number, userIndex: number, e) {
    e.preventDefault();
    const data = {
      username,
      removeUnlock: () => {
        this.results[workplaceIndex].users[userIndex].isLocked = false;
      }
    }

    this.dialogService.open(AdminUnlockConfirmationDialogComponent, data);
  }

  public searchType(data, type) {
    return this.http.post<any>('/api/admin/search/' + type, data, { observe: 'response' });
  }

  public setEstablishmentId(id, username, nmdsId, e): void {
    e.preventDefault();
    this.switchWorkplaceService.navigateToWorkplace(id, username, nmdsId);
  }

  public onSubmit(): void {
    this.form.errors = [];
    this.form.submitted = true;
    // this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.username.length === 0 &&
      this.form.name.length === 0 &&
      this.form.locationid.length === 0 &&
      this.form.employerType.length === 0) {
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
      } else if (this.form.type === 'groups') {
        data = {
          employerType: this.form.employerType,
          parent: this.form.parent
        }
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

  private onError(error) {}

  protected setBackLink(): void {
    this.backService.setBackLink({ url: ['/dashboard'] });
  }

  protected displayAddress(workplace) {
    const secondaryAddress = ' ' + [workplace.address2, workplace.town, workplace.county].filter(Boolean).join(', ') || '';

    return workplace.address1 + secondaryAddress;
  }

  protected displayAddressForGroups(workplace) {
    const secondaryAddress = ' ' + [workplace.address2, workplace.town, workplace.county, workplace.postcode].filter(Boolean).join(', ') || '';

    return workplace.address1 + secondaryAddress;
  }

  public toggleDetails(uid: string, event) {
    event.preventDefault();
    this.workerDetails[uid] = !this.workerDetails[uid];
    this.workerDetailsLabel[uid] = this.workerDetailsLabel[uid] === 'Close' ? 'Open' : 'Close';
  }
}
