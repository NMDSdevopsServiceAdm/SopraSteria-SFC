import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { TrainingProvider } from '@core/model/training-provider.model';

@Component({
  selector: 'app-external-training-provider-input',
  templateUrl: './external-training-provider-input.component.html',
})
export class ExternalTrainingProviderInputComponent implements OnInit {
  @Input() trainingProviders: TrainingProvider[];
  @Input() hideInput: boolean;
  @Input() form: UntypedFormGroup;

  public showSuggestedTray: boolean;
  public trainingProviderNamesWithoutOther: string[];

  constructor() {
    this.getSuggestedListOfProviders = this.getSuggestedListOfProviders.bind(this);
  }

  ngOnInit(): void {
    this.setTrainingProviderNamesWithoutOther();
  }

  public setTrainingProviderNamesWithoutOther(): void {
    this.trainingProviderNamesWithoutOther = this.trainingProviders
      .filter((trainingProvider) => trainingProvider.name !== 'other')
      .map((trainingProvider) => trainingProvider.name);
  }

  /**
   * Function is used to filter
   * @param {void}
   * @return {array}  array of string
   */

  public getSuggestedListOfProviders(): string[] {
    const externalProviderName = this.form?.value.externalProviderName;

    let suggestedList = [];
    if (externalProviderName?.length > 0) {
      suggestedList = this.trainingProviderNamesWithoutOther.filter((trainingProvider) =>
        trainingProvider.toLowerCase().includes(externalProviderName.toLowerCase()),
      );
      this.showSuggestedTray = true;
    }

    if (suggestedList.length === 1 && externalProviderName === suggestedList[0]) {
      this.showSuggestedTray = false;
    }

    if (!this.showSuggestedTray) {
      suggestedList = [];
    }

    return suggestedList;
  }

  public setShowSuggestedTray(): void {
    this.showSuggestedTray = false;
  }
}
