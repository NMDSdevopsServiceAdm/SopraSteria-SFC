import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-submit-button',
  templateUrl: './submit-button.component.html',
})
export class SubmitButtonComponent {
  public workerId: string;
  public returnToSummary: boolean;

  @Input() saveCallback: Function;

  constructor(private route: ActivatedRoute, private router: Router, private workerService: WorkerService) {
    this.workerId = this.route.parent.snapshot.paramMap.get('id');
    this.returnToSummary = this.workerService.returnToSummary;
  }

  async saveAndNavigate(args) {
    if (this.saveCallback) {
      try {
        await this.saveCallback();
        this.router.navigate(args);
      } catch (err) {
        // this should be already handled by saveCallback()
        // keep typescript transpiler silent
      }
    } else {
      throw new TypeError(`'saveCallback' function not provided!`);
    }
  }
}
