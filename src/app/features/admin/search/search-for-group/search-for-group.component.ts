import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GroupSearchRequest } from '@core/model/establishment.model';
import { UserSearchItem } from '@core/model/userDetails.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-for-group',
  templateUrl: './search-for-group.component.html',
})
export class SearchForGroupComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public submitted = false;
  public results: Array<UserSearchItem> = [];
  public establishmentDetails = [];
  public establishmentDetailsLabel = [];
  private subscriptions: Subscription = new Subscription();

  constructor(private formBuilder: FormBuilder, private establishmentService: EstablishmentService) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      employerType: 'All',
      onlyParents: false,
    });
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
      onlyParents: this.form.controls.onlyParents.value,
    };
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
