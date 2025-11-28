import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-data-area-useful-link-recruitment',
    templateUrl: './data-area-useful-link-recruitment.component.html',
    standalone: false
})
export class DataAreaUsefulLinkRecruitmentComponent implements OnInit {
  public usefulLinkRecruitment;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.usefulLinkRecruitment = this.route.snapshot.data.usefulLinkRecruitment?.data;
  }
}
