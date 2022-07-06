import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-make-a-claim-progress-bar',
  templateUrl: './make-a-claim-progress-bar.component.html',
})
export class MakeAClaimProgressBarComponent {
  @Input() stepIndex: number;
  public steps = ['Select qualification', 'Add learners', 'Upload certificate', 'Review and submit'];
}
