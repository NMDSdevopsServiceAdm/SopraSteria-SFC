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

  describe('records added', () => {
    it('should render the total number of training and qualification records added', async () => {
      component.trainingCount = 1;
      component.qualificationsCount = 0;
      fixture.detectChanges();

      const totalTrainingAndQualsText = fixture.debugElement.query(By.css('.asc-total-records--text')).nativeElement;
      const totalTrainingAndQualsCount = fixture.debugElement.query(By.css('.asc-total-records--count')).nativeElement;

      expect(totalTrainingAndQualsText.textContent).toContain('record added');
      expect(totalTrainingAndQualsCount.textContent).toContain('1');
    });

    it('should render the total number of training and qualification records pluralised if records added is more than 1', async () => {
      component.trainingCount = 6;
      component.qualificationsCount = 1;
      fixture.detectChanges();

      const totalTrainingAndQualsText = fixture.debugElement.query(By.css('.asc-total-records--text')).nativeElement;
      const totalTrainingAndQualsCount = fixture.debugElement.query(By.css('.asc-total-records--count')).nativeElement;

      expect(totalTrainingAndQualsText.textContent).toContain('records added');
      expect(totalTrainingAndQualsCount.textContent).toContain('7');
    });
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

    it('should render the total number of training records pluralised if training count is not 1', async () => {
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

    it('should render the total number of qualifications records pluralised if qualification count is not 1', async () => {
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
});
