import { Overlay } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { BackService } from '@core/services/back.service';
import { DialogService } from '@core/services/dialog.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  AdminUnlockConfirmationDialogComponent,
} from '@shared/components/link-to-parent-cancel copy/admin-unlock-confirmation';
import { take } from 'rxjs/operators';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  providers: [DialogService, AdminUnlockConfirmationDialogComponent, Overlay],
})
export class SearchComponent implements OnInit {
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
    errors: [],
  };

  constructor(
    public router: Router,
    public http: HttpClient,
    public switchWorkplaceService: SwitchWorkplaceService,
    private dialogService: DialogService,
    protected backService: BackService,
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

  public setEsblishmentId(id, username, nmdsId, e): void {
    this.switchWorkplaceService.navigateToWorkplace(id, username, nmdsId, e);
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

  private onError(error) {}

  protected setBackLink(): void {
    this.backService.setBackLink({ url: ['/dashboard'] });
  }
}
