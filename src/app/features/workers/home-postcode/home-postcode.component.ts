import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { POSTCODE_PATTERN } from '@core/constants/constants';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

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
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.saveHandler = this.saveHandler.bind(this);
  }

  ngOnInit() {
    this.worker = this.route.parent.snapshot.data.worker;

    this.form = this.formBuilder.group({
      postcode: [null, this.postcodeValidator],
    });

    if (this.worker.postcode) {
      this.form.patchValue({
        postcode: this.worker.postcode,
      });
    }
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
        this.worker.postcode = postcode.value;
        this.subscriptions.add(this.workerService.setWorker(this.worker).subscribe(resolve, reject));
      } else {
        if (postcode.errors.validPostcode) {
          this.messageService.show('error', 'Invalid postcode.');
        } else {
          this.messageService.show('error', 'Please fill the required fields.');
        }

        reject();
      }
    });
  }

  postcodeValidator(control: AbstractControl) {
    return !control.value || POSTCODE_PATTERN.test(control.value) ? null : { validPostcode: true };
  }
}
