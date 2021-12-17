import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UserSearchItem } from '@core/model/admin/search.model';
import { SearchService } from '@core/services/admin/search/search.service';
import { AlertService } from '@core/services/alert.service';
import { DialogService } from '@core/services/dialog.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import {
  AdminUnlockConfirmationDialogComponent,
} from '@shared/components/link-to-parent-cancel copy/admin-unlock-confirmation';
import { SearchDirective } from '@shared/directives/admin/search/search.directive';

@Component({
  selector: 'app-search-for-user',
  templateUrl: './search-for-user.component.html',
})
export class SearchForUserComponent extends SearchDirective {
  public submitted = false;
  public results: UserSearchItem[] = [];

  constructor(
    protected formBuilder: FormBuilder,
    protected searchService: SearchService,
    protected switchWorkplaceService: SwitchWorkplaceService,
    protected alertService: AlertService,
    protected dialogService: DialogService,
  ) {
    super(formBuilder, searchService, switchWorkplaceService, alertService, dialogService);
  }

  protected setupForm(): void {
    this.form = this.formBuilder.group({
      name: null,
      username: null,
      emailAddress: null,
    });
  }

  protected onSubmit(): void {
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

  protected changeStatus(username: string, index: number, event: Event): void {
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
}
