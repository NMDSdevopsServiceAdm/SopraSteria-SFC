import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-drag-and-drop-upload',
  templateUrl: './drag-and-drop-upload.component.html',
})
export class DragAndDropUploadComponent implements OnInit {
  public form: FormGroup;
  public submitted = false;
  public showInvalidFileError = false;
  @Output() fileUploadEvent: EventEmitter<File> = new EventEmitter();

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.setupForm();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      fileUpload: null,
    });
  }

  public onSelect(event: { rejectedFiles: []; addedFiles: [] }): void {
    this.showInvalidFileError = event.rejectedFiles.length > 0;
    this.fileUploadEvent.emit(...event.addedFiles);
  }
}
