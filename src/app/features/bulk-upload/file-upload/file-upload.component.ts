import { Component, Input, OnInit } from '@angular/core';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html'
})
export class FileUploadComponent implements OnInit {
  private submitted = false;
  private form: FormGroup;
  @Input() public multiple?: boolean;

  constructor(
    private errorSummaryService: ErrorSummaryService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.setupForm();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      fileUpload: [null, Validators.required],
    });
  }

  private onFilesSelection($event: Event): void {
    const target = $event.target || $event.srcElement;
    const files = target['files'];
    console.log('files', files);
  }

  public onSubmit(): void {
    console.log('onSubmit fired');
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {

    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

}
