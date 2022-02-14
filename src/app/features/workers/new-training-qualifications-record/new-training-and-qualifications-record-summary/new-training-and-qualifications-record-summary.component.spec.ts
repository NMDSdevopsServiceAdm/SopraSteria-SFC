import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { NewTrainingAndQualificationsRecordSummaryComponent } from './new-training-and-qualifications-record-summary.component';

describe('NewTrainingAndQualificationsRecordSummaryComponent', () => {
  let component: NewTrainingAndQualificationsRecordSummaryComponent;
  let fixture: ComponentFixture<NewTrainingAndQualificationsRecordSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(NewTrainingAndQualificationsRecordSummaryComponent);
    component = fixture.componentInstance;
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
  });

  it('should render the total number of training and qualification records', async () => {
    component.trainingCount = 6;
    component.qualificationsCount = 1;
    fixture.detectChanges();

    const totalTrainingAndQualsText = fixture.debugElement.query(By.css('.asc-total-records--text')).nativeElement;
    const totalTrainingAndQualsCount = fixture.debugElement.query(By.css('.asc-total-records--count')).nativeElement;

    expect(totalTrainingAndQualsText.textContent).toContain('Number of records added:');
    expect(totalTrainingAndQualsCount.textContent).toContain('7');
  });

  describe('training records', () => {
    it('should render the total number of training records', async () => {
      component.trainingCount = 1;
      component.qualificationsCount = 1;
      fixture.detectChanges();

      const totalTrainingCount = fixture.debugElement.query(By.css('[data-testid="trainingCount"]')).nativeElement;
      const totalTrainingText = fixture.debugElement.query(By.css('[data-testid="trainingText"]')).nativeElement;

      expect(totalTrainingCount.textContent).toContain('1');
      expect(totalTrainingText.textContent).toContain('training record');
    });

    it('should render the total number of training records pluralized if training count is not 1', async () => {
      component.trainingCount = 2;
      component.qualificationsCount = 1;
      fixture.detectChanges();

      const totalTrainingCount = fixture.debugElement.query(By.css('[data-testid="trainingCount"]')).nativeElement;
      const totalTrainingText = fixture.debugElement.query(By.css('[data-testid="trainingText"]')).nativeElement;

      expect(totalTrainingCount.textContent).toContain('2');
      expect(totalTrainingText.textContent).toContain('training records');
    });
  });

  describe('qualification records', () => {
    it('should render the total number of qualifications records', async () => {
      component.trainingCount = 1;
      component.qualificationsCount = 1;
      fixture.detectChanges();

      const totalQualificationsCount = fixture.debugElement.query(
        By.css('[data-testid="qualificationsCount"]'),
      ).nativeElement;
      const totalQualificationsText = fixture.debugElement.query(
        By.css('[data-testid="qualificationsText"]'),
      ).nativeElement;

      expect(totalQualificationsCount.textContent).toContain('1');
      expect(totalQualificationsText.textContent).toContain('qualification record');
    });

    it('should render the total number of qualifications records pluralized if qualification count is not 1', async () => {
      component.trainingCount = 1;
      component.qualificationsCount = 2;
      fixture.detectChanges();

      const totalQualificationsCount = fixture.debugElement.query(
        By.css('[data-testid="qualificationsCount"]'),
      ).nativeElement;
      const totalQualificationsText = fixture.debugElement.query(
        By.css('[data-testid="qualificationsText"]'),
      ).nativeElement;

      expect(totalQualificationsCount.textContent).toContain('2');
      expect(totalQualificationsText.textContent).toContain('qualification records');
    });
  });
  describe('Mandatory training records to be added', () => {
    it('should show the number of mandatory training records to be added when greater than 0', async () => {
      component.mandatoryTrainingCount = 1;
      component.trainingCount = 1;
      component.qualificationsCount = 2;
      fixture.detectChanges();

      const mandatoryTrainingCount = fixture.debugElement.query(
        By.css('[data-testid="mandatoryTrainingCount"]'),
      ).nativeElement;
      const mandatoryTrainingText = fixture.debugElement.query(
        By.css('[data-testid="mandatoryTrainingText"]'),
      ).nativeElement;

      expect(mandatoryTrainingCount.textContent).toContain('1');
      expect(mandatoryTrainingText.textContent).toContain('mandatory training record needs to be added');
    });

    it('should show the number of mandatory training records to be added when greater than 0, and pluralized if mandatory training count to be added is greater than 1', async () => {
      component.mandatoryTrainingCount = 2;
      component.trainingCount = 1;
      component.qualificationsCount = 2;
      fixture.detectChanges();

      const mandatoryTrainingCount = fixture.debugElement.query(
        By.css('[data-testid="mandatoryTrainingCount"]'),
      ).nativeElement;
      const mandatoryTrainingText = fixture.debugElement.query(
        By.css('[data-testid="mandatoryTrainingText"]'),
      ).nativeElement;

      expect(mandatoryTrainingCount.textContent).toContain('2');
      expect(mandatoryTrainingText.textContent).toContain('mandatory training records need to be added');
    });

    it('should not show the number of mandatory training records to be added, when equal to 0', async () => {
      component.mandatoryTrainingCount = 0;
      component.trainingCount = 1;
      component.qualificationsCount = 2;
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('[data-testid="mandatoryTrainingCount"]'))).toBeFalsy();
      expect(fixture.debugElement.query(By.css('[data-testid="mandatoryTrainingText"]'))).toBeFalsy();
    });
  });

  describe('Expired training records', () => {
    it('should show the number of expired training records when greater than 0', async () => {
      component.expiredTrainingCount = 1;
      component.trainingCount = 1;
      component.qualificationsCount = 2;
      fixture.detectChanges();

      const expiredTrainingCount = fixture.debugElement.query(
        By.css('[data-testid="expiredTrainingCount"]'),
      ).nativeElement;
      const expiredTrainingText = fixture.debugElement.query(
        By.css('[data-testid="expiredTrainingText"]'),
      ).nativeElement;

      expect(expiredTrainingCount.textContent).toContain('1');
      expect(expiredTrainingText.textContent).toContain('record has expired');
    });

    it('should show the number of expired training records when greater than 0, and pluralized if expired training count is greater than 1', async () => {
      component.expiredTrainingCount = 2;
      component.trainingCount = 1;
      component.qualificationsCount = 2;
      fixture.detectChanges();

      const expiredTrainingCount = fixture.debugElement.query(
        By.css('[data-testid="expiredTrainingCount"]'),
      ).nativeElement;
      const expiredTrainingText = fixture.debugElement.query(
        By.css('[data-testid="expiredTrainingText"]'),
      ).nativeElement;

      expect(expiredTrainingCount.textContent).toContain('2');
      expect(expiredTrainingText.textContent).toContain('records have expired');
    });

    it('should not show the number of expired training records when equal to 0', async () => {
      component.expiredTrainingCount = 0;
      component.trainingCount = 1;
      component.qualificationsCount = 2;
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('[data-testid="expiredTrainingCount"]'))).toBeFalsy();
      expect(fixture.debugElement.query(By.css('[data-testid="expiredTrainingText"]'))).toBeFalsy();
    });
  });

  describe('Expires soon training records', () => {
    it('should show the number of expiring soon training records when greater than 0', async () => {
      component.expiresSoonTrainingCount = 1;
      component.trainingCount = 1;
      component.qualificationsCount = 2;
      fixture.detectChanges();

      const expiresSoonTrainingCount = fixture.debugElement.query(
        By.css('[data-testid="expiresSoonTrainingCount"]'),
      ).nativeElement;
      const expiresSoonTrainingText = fixture.debugElement.query(
        By.css('[data-testid="expiresSoonTrainingText"]'),
      ).nativeElement;

      expect(expiresSoonTrainingCount.textContent).toContain('1');
      expect(expiresSoonTrainingText.textContent).toContain('record expires soon');
    });

    it('should show the number of expiring soon training records when greater than 0, and pluralized if expired training count is greater than 1', async () => {
      component.expiresSoonTrainingCount = 2;
      component.trainingCount = 1;
      component.qualificationsCount = 2;
      fixture.detectChanges();

      const expiresSoonTrainingCount = fixture.debugElement.query(
        By.css('[data-testid="expiresSoonTrainingCount"]'),
      ).nativeElement;
      const expiresSoonTrainingText = fixture.debugElement.query(
        By.css('[data-testid="expiresSoonTrainingText"]'),
      ).nativeElement;

      expect(expiresSoonTrainingCount.textContent).toContain('2');
      expect(expiresSoonTrainingText.textContent).toContain('records expire soon');
    });

    it('should not show the number of expiring soon training records when equal to 0', async () => {
      component.expiresSoonTrainingCount = 0;
      component.trainingCount = 1;
      component.qualificationsCount = 2;
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('[data-testid="expiresSoonTrainingCount"]'))).toBeFalsy();
      expect(fixture.debugElement.query(By.css('[data-testid="expiresSoonTrainingText"]'))).toBeFalsy();
    });
  });
});
