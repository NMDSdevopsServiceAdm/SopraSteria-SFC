import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErrorSummaryService {
  public syncFormErrorsEvent: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
}
