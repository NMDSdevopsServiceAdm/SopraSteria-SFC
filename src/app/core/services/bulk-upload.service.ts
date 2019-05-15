import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BulkUploadService {
  public selectedFiles$: BehaviorSubject<Array<File>> = new BehaviorSubject(null);
}
