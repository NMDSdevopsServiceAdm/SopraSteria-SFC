import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Worker } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-add-training',
  templateUrl: './add-training.component.html',
})
export class AddTrainingComponent implements OnInit {
  public worker: Worker;
  public form: FormGroup;

  constructor(private formBuilder: FormBuilder, private workerService: WorkerService) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      name: null,
      category: null,
      accredited: null,
      completed: this.formBuilder.group({
        day: null,
        month: null,
        year: null,
      }),
      expiry: this.formBuilder.group({
        day: null,
        month: null,
        year: null,
      }),
      notes: null,
    });

    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;
    });
  }

  submitHandler() {
    console.log(this.form.getRawValue());
  }
}
