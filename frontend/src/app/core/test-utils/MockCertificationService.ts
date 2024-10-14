import { Injectable } from '@angular/core';
import { QualificationCertificateService, TrainingCertificateService } from '@core/services/certificate.service';

@Injectable()
export class MockTrainingCertificateService extends TrainingCertificateService {}

@Injectable()
export class MockQualificationCertificateService extends QualificationCertificateService {}
