import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-drag-and-drop-upload',
  templateUrl: './drag-and-drop-upload.component.html',
})
export class DragAndDropUploadComponent implements OnInit {
  public form: FormGroup;
  public submitted = false;
  public invalidFileErrorMessage: string | null = null;
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

  public onSelect(event: { rejectedFiles: File[]; addedFiles: File[] }): void {
    const totalFilesLength = [...event.addedFiles, ...event.rejectedFiles].length;
    if (event.rejectedFiles.length > 0) {
      this.invalidFileErrorMessage =
        totalFilesLength > 1 ? 'You can only upload single files.' : 'You can only upload CSV files.';
      return;
    }

    this.invalidFileErrorMessage = null;
    this.fileUploadEvent.emit(...event.addedFiles);
  }
}
