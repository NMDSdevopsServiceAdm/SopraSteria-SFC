import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UserSearchItem } from '@core/model/admin/search.model';
import { SearchService } from '@core/services/admin/search/search.service';
import { AlertService } from '@core/services/alert.service';
import { DialogService } from '@core/services/dialog.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
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

  public onSubmit(): void {
    console.log('****** onSubmit ********');
    console.log(this.form.value);
    this.subscriptions.add(
      this.searchService.searchUsers(this.form.value).subscribe(
        (response) => {
          this.results = response;
          this.submitted = true;
        },
        (error) => {
          console.error('Error:');
          console.error(error);
          this.errorMessage();
        },
      ),
    );
  }

  public unlockWorkplaceUser(username: string, index: number, event: Event): void {
    event.preventDefault();
    this.unlockUser(username, index, this.results[index]);
  }
}
