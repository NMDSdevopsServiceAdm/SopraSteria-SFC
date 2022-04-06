import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-drag-and-drop-upload',
  templateUrl: './drag-and-drop-upload.component.html',
})
export class DragAndDropUploadComponent implements OnInit {
  public form: FormGroup;
  public submitted = false;
  public showInvalidFileError = false;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.setupForm();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      fileUpload: null,
    });
  }

  public onSelect(event): void {
    this.showInvalidFileError = event.rejectedFiles.length > 0;
  }
}
