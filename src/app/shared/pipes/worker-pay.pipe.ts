import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { WorkerPay } from '@core/model/worker.model';

@Pipe({
  name: 'workerPay',
})
export class WorkerPayPipe extends DecimalPipe implements PipeTransform {
  transform(workerPay: WorkerPay) {
    if (!workerPay) {
      return null;
    }
    if (!workerPay.rate || workerPay.rate === null) {
      return workerPay.value;
    }
    let format = '1';
    switch (workerPay.value) {
      case 'Annually':
        format = '1.0-0';
        break;
      case 'Hourly':
        format = '1.2-2';
        break;
    }
    return `£${super.transform(workerPay.rate, format)} ${workerPay.value}`;
  }
}
