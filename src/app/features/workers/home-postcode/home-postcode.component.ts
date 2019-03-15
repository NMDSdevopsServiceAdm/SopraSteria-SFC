import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { POSTCODE_PATTERN } from '@core/constants/constants';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-home-postcode',
  templateUrl: './home-postcode.component.html',
})
export class HomePostcodeComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  private worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private workerService: WorkerService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private router: Router
  ) {
    this.saveHandler = this.saveHandler.bind(this);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      postcode: [null, this.postcodeValidator],
    });

    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;

      if (this.worker.postcode) {
        this.form.patchValue({
          postcode: this.worker.postcode,
        });
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.messageService.clearAll();
  }

  async submitHandler() {
    try {
      await this.saveHandler();
      this.router.navigate(['/worker', this.worker.uid, 'gender']);
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { postcode } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        const props = {
          postcode: postcode.value,
        };

        this.subscriptions.add(
          this.workerService.updateWorker(this.worker.uid, props).subscribe(data => {
            this.workerService.setState({ ...this.worker, ...data });
            resolve();
          }, reject)
        );
      } else {
        if (postcode.errors.validPostcode) {
          this.messageService.show('error', 'Invalid postcode.');
        }

        reject();
      }
    });
  }

  postcodeValidator(control: AbstractControl) {
    return !control.value || POSTCODE_PATTERN.test(control.value) ? null : { validPostcode: true };
  }
}
