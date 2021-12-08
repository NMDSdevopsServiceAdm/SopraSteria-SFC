import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SearchService } from '@core/services/admin/search/search.service';
import { AlertService } from '@core/services/alert.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-for-workplace',
  templateUrl: './search-for-workplace.component.html',
})
export class SearchForWorkplaceComponent implements OnInit, OnDestroy {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public results = [];
  public submitted: boolean;
  private subscriptions: Subscription = new Subscription();
  public workplaceDetails = [];
  public workplaceDetailsLabel = [];

  constructor(
    public formBuilder: FormBuilder,
    public searchService: SearchService,
    private switchWorkplaceService: SwitchWorkplaceService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: null,
      postcode: null,
      nmdsId: null,
      locationId: null,
      provId: null,
    });
  }

  public onSubmit(): void {
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

  private errorMessage(): void {
    this.alertService.addAlert({
      type: 'warning',
      message: 'There was a problem making this request',
    });
  }

  public navigateToWorkplace = (id: string, username: string, nmdsId: string, event: Event) => {
    event.preventDefault();
    this.switchWorkplaceService.navigateToWorkplace(id, username, nmdsId);
  };

  public toggleDetails(uid: string, event: Event): void {
    event.preventDefault();
    this.workplaceDetails[uid] = !this.workplaceDetails[uid];
    this.workplaceDetailsLabel[uid] = this.workplaceDetailsLabel[uid] === 'Close' ? 'Open' : 'Close';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
