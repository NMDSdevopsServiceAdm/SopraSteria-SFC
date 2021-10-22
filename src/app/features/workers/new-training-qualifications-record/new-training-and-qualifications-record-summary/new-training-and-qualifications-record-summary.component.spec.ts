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

    const totalTrainingAndQualsText = fixture.debugElement.query(By.css('.totalRecords__text')).nativeElement;
    const totalTrainingAndQualsCount = fixture.debugElement.query(By.css('.totalRecords__count')).nativeElement;

    expect(totalTrainingAndQualsText.textContent).toContain('Number of records added:');
    expect(totalTrainingAndQualsCount.textContent).toContain('7');
  });

  describe('training records', () => {
    it('should render the total number of training records', async () => {
      component.trainingCount = 1;
      component.qualificationsCount = 1;
      fixture.detectChanges();

      const totalTrainingText = fixture.debugElement.query(By.css('[data-testid="training"]')).nativeElement;

      expect(totalTrainingText.textContent).toContain('1');
      expect(totalTrainingText.textContent).toContain('training record');
    });

    it('should render the total number of training records pluralized if training count is not 1', async () => {
      component.trainingCount = 2;
      component.qualificationsCount = 1;
      fixture.detectChanges();

      const totalTrainingText = fixture.debugElement.query(By.css('[data-testid="training"]')).nativeElement;

      expect(totalTrainingText.textContent).toContain('2');
      expect(totalTrainingText.textContent).toContain('training records');
    });
  });

  describe('qualification records', () => {
    it('should render the total number of qualifications records', async () => {
      component.trainingCount = 1;
      component.qualificationsCount = 1;
      fixture.detectChanges();

      const totalQualificationsText = fixture.debugElement.query(
        By.css('[data-testid="qualifications"]'),
      ).nativeElement;

      expect(totalQualificationsText.textContent).toContain('1');
      expect(totalQualificationsText.textContent).toContain('qualification record');
    });

    it('should render the total number of qualifications records pluralized if qualification count is not 1', async () => {
      component.trainingCount = 1;
      component.qualificationsCount = 2;
      fixture.detectChanges();

      const totalQualificationsText = fixture.debugElement.query(
        By.css('[data-testid="qualifications"]'),
      ).nativeElement;

      expect(totalQualificationsText.textContent).toContain('2');
      expect(totalQualificationsText.textContent).toContain('qualification records');
    });
  });

  describe('Expired training records', () => {
    it('should show the number of expired training records when greater than 0', async () => {
      component.expiredTrainingCount = 1;
      component.trainingCount = 1;
      component.qualificationsCount = 2;
      fixture.detectChanges();

      const expiredTrainingText = fixture.debugElement.query(By.css('[data-testid="expiredTraining"]')).nativeElement;

      expect(expiredTrainingText.textContent).toContain('1');
      expect(expiredTrainingText.textContent).toContain('record has expired');
    });

    it('should show the number of expired training records when greater than 0, and pluralized if expired training count is greater than 1', async () => {
      component.expiredTrainingCount = 2;
      component.trainingCount = 1;
      component.qualificationsCount = 2;
      fixture.detectChanges();

      const expiredTrainingText = fixture.debugElement.query(By.css('[data-testid="expiredTraining"]')).nativeElement;

      expect(expiredTrainingText.textContent).toContain('2');
      expect(expiredTrainingText.textContent).toContain('records have expired');
    });

    it('should not show the number of expired training records when equal to 0', async () => {
      component.expiredTrainingCount = 0;
      component.trainingCount = 1;
      component.qualificationsCount = 2;
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('[data-testid="expiredTraining"]'))).toBeFalsy();
    });
  });

  describe('Expires soon training records', () => {
    it('should show the number of expiring soon training records when greater than 0', async () => {
      component.expiresSoonTrainingCount = 1;
      component.trainingCount = 1;
      component.qualificationsCount = 2;
      fixture.detectChanges();

      const expiresSoonTrainingText = fixture.debugElement.query(
        By.css('[data-testid="expiresSoonTraining"]'),
      ).nativeElement;

      expect(expiresSoonTrainingText.textContent).toContain('1');
      expect(expiresSoonTrainingText.textContent).toContain('record expires soon');
    });

    it('should show the number of expiring soon training records when greater than 0, and pluralized if expired training count is greater than 1', async () => {
      component.expiresSoonTrainingCount = 2;
      component.trainingCount = 1;
      component.qualificationsCount = 2;
      fixture.detectChanges();

      const expiresSoonTrainingText = fixture.debugElement.query(
        By.css('[data-testid="expiresSoonTraining"]'),
      ).nativeElement;

      expect(expiresSoonTrainingText.textContent).toContain('2');
      expect(expiresSoonTrainingText.textContent).toContain('records expire soon');
    });

    it('should not show the number of expiring soon training records when equal to 0', async () => {
      component.expiresSoonTrainingCount = 0;
      component.trainingCount = 1;
      component.qualificationsCount = 2;
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('[data-testid="expiresSoonTraining"]'))).toBeFalsy();
    });
  });
});
