import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { WorkplaceSearchItem } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-for-group',
  templateUrl: './search-for-group.component.html',
})
export class SearchForGroupComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public submitted = false;
  public results: Array<WorkplaceSearchItem> = [];
  public workplaceDetails = [];
  public workplaceDetailsLabel = [];
  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private establishmentService: EstablishmentService,
    private switchWorkplaceService: SwitchWorkplaceService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      employerType: 'All',
      parent: false,
    });
  }

  public navigateToWorkplace(id: string, username: string, nmdsId: string, event: Event): void {
    event.preventDefault();
    this.switchWorkplaceService.navigateToWorkplace(id, username, nmdsId);
  }

  public toggleDetails(uid: string, event: Event): void {
    event.preventDefault();
    this.workplaceDetails[uid] = !this.workplaceDetails[uid];
    this.workplaceDetailsLabel[uid] = this.workplaceDetailsLabel[uid] === 'Close' ? 'Open' : 'Close';
  }

  public onSubmit(): void {
    this.subscriptions.add(
      this.establishmentService.searchGroups(this.form.value).subscribe(
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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
