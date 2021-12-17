import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SearchService } from '@core/services/admin/search/search.service';
import { AlertService } from '@core/services/alert.service';
import { DialogService } from '@core/services/dialog.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { SearchDirective } from '@shared/directives/admin/search/search.directive';

@Component({
  selector: 'app-search-for-workplace',
  templateUrl: './search-for-workplace.component.html',
})
export class SearchForWorkplaceComponent extends SearchDirective {
  public results = [];
  public submitted = false;

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
      postcode: null,
      nmdsId: null,
      locationId: null,
      provId: null,
    });
  }

  protected onSubmit(): void {
    this.subscriptions.add(
      this.searchService.searchWorkplaces(this.form.value).subscribe(
        (response) => {
          this.results = response;
          this.submitted = true;
        },
        () => this.errorMessage(),
      ),
    );
  }
}
