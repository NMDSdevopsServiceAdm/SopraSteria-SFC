import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CertificateDownload } from '@core/model/training.model';
import { Certificate } from '@core/model/trainingAndQualifications.model';
import { Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BaseCertificateService {
  constructor(private http: HttpClient) {
    if (this.constructor == BaseCertificateService) {
      throw new Error("Abstract base class can't be instantiated.");
    }
  }

  protected getBaseEndpoint(workplaceUid: string, workerUid: string, recordUid: string): string {
    throw new Error('Not implemented for base class');
  }

  public addCertificates(
    workplaceUid: string,
    workerUid: string,
    recordUid: string,
    filesToUpload: File[],
  ): Observable<any> {
    return of(null);
  }

  public downloadCertificates(
    workplaceUid: string,
    workerUid: string,
    recordUid: string,
    filesToDownload: CertificateDownload[],
  ): Observable<any> {
    return of(null);
  }

  public deleteCertificates(
    workplaceUid: string,
    workerUid: string,
    recordUid: string,
    filesToDelete: Certificate[],
  ): Observable<any> {
    return of(null);
  }
}

@Injectable()
export class TrainingCertificateService extends BaseCertificateService {
  protected getBaseEndpoint(workplaceUid: string, workerUid: string, trainingUid: string): string {
    return `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerUid}/training/${trainingUid}/certificate`;
  }
}

@Injectable()
export class QualificationCertificateService extends BaseCertificateService {
  protected getBaseEndpoint(workplaceUid: string, workerUid: string, qualificationUid: string): string {
    return `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerUid}/qualification/${qualificationUid}/certificate`;
  }
}
