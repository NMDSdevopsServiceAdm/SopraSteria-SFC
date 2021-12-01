import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SearchService } from '@core/services/admin/search/search.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-for-workplace',
  templateUrl: './search-for-workplace.component.html',
})
export class SearchForWorkplaceComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public results = [];
  public submitted: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(public http: HttpClient, public formBuilder: FormBuilder, public searchService: SearchService) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      workplaceName: null,
      postcode: null,
      nmdsId: null,
      locationid: null,
      providerid: null,
    });
  }

  public onSubmit(): void {
    this.subscriptions.add(
      this.searchService.searchWorkplaces(this.form.value).subscribe(
        (response) => {
          this.results = response;
          this.submitted = true;
        },
        (error) => {
          console.error(error);
        },
      ),
    );
  }

  public setEstablishmentId = (id: string, username: string, nmdsId: string, event: Event) => {
    event.preventDefault();
    console.log('setEstablishmentId');
  };

  public toggleDetails(uid: string, event: Event) {
    event.preventDefault();
    console.log('toggleDetails');
  }
}
