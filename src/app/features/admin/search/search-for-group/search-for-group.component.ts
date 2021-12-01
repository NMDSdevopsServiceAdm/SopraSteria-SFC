import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserSearchItem } from '@core/model/userDetails.model';

@Component({
  selector: 'app-search-for-group',
  templateUrl: './search-for-group.component.html',
})
export class SearchForGroupComponent implements OnInit {
  public form: FormGroup;
  public submitted = false;
  public results: Array<UserSearchItem> = [];
  public userDetails = [];
  public userDetailsLabel = [];

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      employerType: 'All',
      onlyParents: false,
    });
  }

  public onSubmit(): void {
    const data = this.getRequestData();
    this.searchGroups(data);
  }

  public searchGroups(data) {
    return null;
  }

  private getRequestData(): GroupSearchRequest {
    return {
      employerType: this.form.controls.employerType.value,
      onlyParents: this.form.controls.onlyParents.value,
    };
  }
}

interface GroupSearchRequest {
  employerType: string;
  onlyParents: boolean;
}
