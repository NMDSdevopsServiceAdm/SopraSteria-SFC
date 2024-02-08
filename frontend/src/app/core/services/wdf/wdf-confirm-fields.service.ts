import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WdfConfirmFieldsService {
  public confirmedFields: Array<string> = [];

  public getConfirmedFields(): Array<string> {
    return this.confirmedFields;
  }

  public addToConfirmedFields(field: string): void {
    this.confirmedFields.push(field);
  }

  public clearConfirmFields(): void {
    this.confirmedFields = [];
  }
}
