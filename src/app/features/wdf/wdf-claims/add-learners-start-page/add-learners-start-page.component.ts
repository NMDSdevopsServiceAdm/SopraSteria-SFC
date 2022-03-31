import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-learners-start-page',
  templateUrl: './add-learners-start-page.component.html',
})
export class AddLearnersStartPageComponent implements OnInit {
  public claimType: string;
  public dobRequired: boolean;

  ngOnInit(): void {
    this.claimType = history.state?.claimType;
    this.dobRequired = ['learningProgramme', 'digitalModule'].includes(this.claimType);
  }
}
