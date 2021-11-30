import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Wizard } from '@core/model/wizard.model';

@Component({
  selector: 'app-first-login-wizard',
  templateUrl: './first-login-wizard.component.html',
  styleUrls: ['./first-login-wizard.component.scss'],
})
export class FirstLoginWizardComponent {
  public wizards: Wizard[];
  public isFirst: boolean;
  public isLast: boolean;
  public currentIndex: number;
  public imageUrl: string;
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.wizards = this.route.snapshot.data.wizard.data;
    this.imageUrl = 'https://sfccmstest.cloudapps.digital/assets/';
    this.currentIndex = 0;
    this.updateVariables();
  }

  public updateVariables(): void {
    this.isFirst = this.currentIndex === 0;
    this.isLast = this.currentIndex === this.wizards.length - 1;
  }

  public nextWizard(event: Event): void {
    event.preventDefault();
    this.currentIndex += 1;
    this.updateVariables();
  }

  public previousWizard(event: Event): void {
    event.preventDefault();
    this.currentIndex -= 1;
    this.updateVariables();
  }
}
