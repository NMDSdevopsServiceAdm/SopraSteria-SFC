import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { UserDetails } from '@core/model/userDetails.model';

@Injectable({
  providedIn: 'root',
})
export class CreateAccountService {
  public accountDetails$: BehaviorSubject<UserDetails> = new BehaviorSubject(null);
}
