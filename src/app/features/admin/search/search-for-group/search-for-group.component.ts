import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { WorkplaceSearchItem } from '@core/model/admin/search.model';
import { SearchService } from '@core/services/admin/search/search.service';
import { AlertService } from '@core/services/alert.service';
import { DialogService } from '@core/services/dialog.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { SearchDirective } from '@shared/directives/admin/search/search.directive';

@Component({
  selector: 'app-search-for-group',
  templateUrl: './search-for-group.component.html',
})
export class SearchForGroupComponent extends SearchDirective {
  public form: FormGroup;
  public submitted = false;
  public results: WorkplaceSearchItem[] = [];

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
      employerType: 'All',
      parent: false,
    });
  }

  protected onSubmit(): void {
    this.subscriptions.add(
      this.searchService.searchGroups(this.form.value).subscribe(
        (response) => {
          this.results = response;
          this.submitted = true;
        },
        () => this.errorMessage(),
      ),
    );
  }
}
