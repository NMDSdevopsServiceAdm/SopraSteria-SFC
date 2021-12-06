import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserSearchItem } from '@core/model/admin/search.model';
import { SearchService } from '@core/services/admin/search/search.service';
import { AlertService } from '@core/services/alert.service';
import { DialogService } from '@core/services/dialog.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { AdminUnlockConfirmationDialogComponent } from '@shared/components/link-to-parent-cancel copy/admin-unlock-confirmation';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-for-user',
  templateUrl: './search-for-user.component.html',
})
export class SearchForUserComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public submitted = false;
  public results: UserSearchItem[] = [];
  public userDetails = [];
  public userDetailsLabel = [];
  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private searchService: SearchService,
    private switchWorkplaceService: SwitchWorkplaceService,
    private dialogService: DialogService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: null,
      username: null,
      emailAddress: null,
    });
  }

  public onSubmit(): void {
    this.subscriptions.add(
      this.searchService.searchUsers(this.form.value).subscribe(
        (response) => {
          this.results = response;
          this.submitted = true;
        },
        () => this.errorMessage(),
      ),
    );
  }

  private errorMessage(): void {
    this.alertService.addAlert({
      type: 'warning',
      message: 'There was a problem making this request',
    });
  }
  public navigateToWorkplace(id: string, username: string, nmdsId: string, event: Event): void {
    event.preventDefault();
    this.switchWorkplaceService.navigateToWorkplace(id, username, nmdsId);
  }

  public toggleDetails(uid: string, event: Event): void {
    event.preventDefault();
    this.userDetails[uid] = !this.userDetails[uid];
    this.userDetailsLabel[uid] = this.userDetailsLabel[uid] === 'Close' ? 'Open' : 'Close';
  }

  public unlockUser(username: string, index: number, event: Event): void {
    event.preventDefault();
    const data = {
      username,
      index,
      removeUnlock: () => {
        this.results[index].isLocked = false;
      },
    };
    this.dialogService.open(AdminUnlockConfirmationDialogComponent, data);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
