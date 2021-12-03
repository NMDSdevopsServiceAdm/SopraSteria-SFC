import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GroupSearchRequest, WorkplaceSearchItem } from '@core/model/establishment.model';
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
  public establishmentDetails = [];
  public establishmentDetailsLabel = [];
  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private establishmentService: EstablishmentService,
    private switchWorkplaceService: SwitchWorkplaceService,
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      employerType: 'All',
      parent: false,
    });
  }

  public navigate(id: string, username: string, nmdsId: string, event: Event): void {
    event.preventDefault();
    this.navigateToWorkplace({ id, username, nmdsId });
  }

  public navigateToWorkplace(workplace): void {
    this.switchWorkplaceService.navigateToWorkplace(workplace.id, workplace.username, workplace.nmdsId);
  }

  public toggleDetails(uid: string, event: Event): void {
    event.preventDefault();
    this.establishmentDetails[uid] = !this.establishmentDetails[uid];
    this.establishmentDetailsLabel[uid] = this.establishmentDetailsLabel[uid] === 'Close' ? 'Open' : 'Close';
  }

  public onSubmit(): void {
    const data = this.getRequestData();
    this.subscriptions.add(
      this.establishmentService.searchGroups(data).subscribe(
        (response) => {
          this.results = response;
          this.submitted = true;
        },
        (error) => console.error(error),
      ),
    );
  }

  private getRequestData(): GroupSearchRequest {
    return {
      employerType: this.form.controls.employerType.value,
      parent: this.form.controls.parent.value,
    };
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
