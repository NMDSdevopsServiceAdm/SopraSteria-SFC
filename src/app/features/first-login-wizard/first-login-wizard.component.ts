import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Wizard } from '@core/model/wizard.model';

@Component({
  selector: 'app-first-login-wizard',
  templateUrl: './first-login-wizard.component.html',
})
export class FirstLoginWizardComponent {
  public wizard: Wizard;
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.wizard = this.route.snapshot.data.wizard;
    console.log(this.wizard);
  }
}
