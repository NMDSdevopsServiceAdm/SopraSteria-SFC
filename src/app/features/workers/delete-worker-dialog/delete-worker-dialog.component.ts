import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';

@Component({
  selector: 'app-delete-worker-dialog',
  templateUrl: './delete-worker-dialog.component.html',
  styleUrls: ['./delete-worker-dialog.component.scss'],
})
export class DeleteWorkerDialogComponent implements OnInit {
  public reasons = [
    { id: 1, reason: 'They moved to another adult social care employer' },
    { id: 2, reason: 'They moved to a role in the health sector' },
    { id: 3, reason: 'They moved to a different sector (e.g. retail)' },
    { id: 4, reason: 'They moved to another role in this organisation' },
    { id: 5, reason: 'The worker chose to leave (destination unknown)' },
    { id: 6, reason: 'The worker retired' },
    { id: 7, reason: 'Employer terminated their employment' },
    { id: 8, reason: 'Other' },
    { id: 9, reason: 'Not known' },
  ];
  private form: FormGroup;

  constructor(
    @Inject(DIALOG_DATA) public data: any,
    public dialog: Dialog<DeleteWorkerDialogComponent>,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      reason: null,
    });
  }

  ngOnInit() {
    console.log(this.data);
  }

  close() {
    this.dialog.close('homie');
  }
}
