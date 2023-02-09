import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { NewTrainingComponent } from './new-training.component';

describe('NewTrainingComponent', async () => {
  let component: NewTrainingComponent;
  let fixture: ComponentFixture<NewTrainingComponent>;

  const trainingCategories = [
    {
      category: 'Autism',
      id: 2,
      trainingRecords: [
        {
          accredited: true,
          completed: new Date('10/23/2021'),
          expires: new Date('10/23/2022'),
          title: 'Autism training',
          trainingCategory: { id: 2, category: 'Autism' },
          uid: 'someAutismUid',
          trainingStatus: 1,
          created: new Date('10/23/2021'),
          updatedBy: 'admin',
          updated: new Date('10/23/2021'),
        },
        {
          accredited: true,
          completed: new Date('10/20/2021'),
          expires: new Date('10/20/2022'),
          title: 'Autism training 2',
          trainingCategory: { id: 2, category: 'Autism' },
          uid: 'someAutismUid2',
          trainingStatus: 2,
          created: new Date('10/20/2021'),
          updatedBy: 'admin',
          updated: new Date('10/20/2021'),
        },
      ],
    },
    {
      category: 'Communication',
      id: 3,
      trainingRecords: [
        {
          accredited: true,
          completed: new Date('09/20/2020'),
          expires: new Date('09/20/2021'),
          title: 'Communication training',
          trainingCategory: { id: 3, category: 'Communication' },
          uid: 'someCommunicationUid',
          trainingStatus: 3,
          created: new Date('09/20/2020'),
          updatedBy: 'admin',
          updated: new Date('09/20/2020'),
        },
      ],
    },
    {
      category: 'Health',
      id: 1,
      trainingRecords: [
        {
          accredited: false,
          completed: new Date('10/20/2021'),
          expires: new Date('10/20/2022'),
          title: 'Health training',
          trainingCategory: { id: 1, category: 'Health' },
          uid: 'someHealthUid',
          trainingStatus: 0,
          created: new Date('10/20/2021'),
          updatedBy: 'admin',
          updated: new Date('10/20/2021'),
        },
        {
          accredited: false,
          completed: new Date('10/20/2021'),
          expires: new Date('10/20/2022'),
          title: '',
          trainingCategory: { id: 1, category: 'Health' },
          uid: 'someHealthUid2',
          trainingStatus: 0,
          created: new Date('10/20/2021'),
          updatedBy: 'admin',
          updated: new Date('10/20/2021'),
        },
      ],
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      providers: [],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewTrainingComponent);
    component = fixture.componentInstance;
    component.canEditWorker = true;
    component.trainingCategories = trainingCategories;
    component.isMandatoryTraining = false;
    fixture.detectChanges();
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
  });

  describe('training record table contents', async () => {
    it('should render a category heading name for each training record category', async () => {
      const autismCategory = fixture.debugElement.query(By.css('[data-testid="category-Autism"]')).nativeElement;
      const communicationCategory = fixture.debugElement.query(
        By.css('[data-testid="category-Communication"]'),
      ).nativeElement;
      const healthCategory = fixture.debugElement.query(By.css('[data-testid="category-Health"]')).nativeElement;

      expect(autismCategory.textContent).toContain('Autism');
      expect(communicationCategory.textContent).toContain('Communication');
      expect(healthCategory.textContent).toContain('Health');
    });

    it('should render missing training name when there is no title for a training record', async () => {
      component.canEditWorker = true;
      fixture.detectChanges();

      const healthTrainingTitle = fixture.debugElement.query(
        By.css('[data-testid="Title-someHealthUid"]'),
      ).nativeElement;
      const healthTraining2Title = fixture.debugElement.query(
        By.css('[data-testid="Title-someHealthUid2"]'),
      ).nativeElement;

      expect(healthTrainingTitle.textContent).toContain('Health training');
      expect(healthTraining2Title.textContent).toContain('Missing training name (Add)');
    });
  });

  describe('training record links', async () => {
    it('training title should have link to training records if you are an edit user', () => {
      component.canEditWorker = true;
      fixture.detectChanges();

      const autismTrainingTitleLink = fixture.debugElement.query(
        By.css('[data-testid="Title-someAutismUid"]'),
      ).nativeElement;
      const autismTraining2TitleLink = fixture.debugElement.query(
        By.css('[data-testid="Title-someAutismUid2"]'),
      ).nativeElement;
      const communicationTrainingTitleLink = fixture.debugElement.query(
        By.css('[data-testid="Title-someCommunicationUid"]'),
      ).nativeElement;
      const healthTrainingTitleLink = fixture.debugElement.query(
        By.css('[data-testid="Title-someHealthUid"]'),
      ).nativeElement;
      const healthTraining2TitleLink = fixture.debugElement.query(
        By.css('[data-testid="Title-someHealthUid2"]'),
      ).nativeElement;

      expect(
        autismTrainingTitleLink
          .getAttribute('href')
          .slice(0, autismTrainingTitleLink.getAttribute('href').indexOf(';')),
      ).toBe('/training/someAutismUid');
      expect(
        autismTraining2TitleLink
          .getAttribute('href')
          .slice(0, autismTraining2TitleLink.getAttribute('href').indexOf(';')),
      ).toBe('/training/someAutismUid2');
      expect(
        communicationTrainingTitleLink
          .getAttribute('href')
          .slice(0, communicationTrainingTitleLink.getAttribute('href').indexOf(';')),
      ).toBe('/training/someCommunicationUid');
      expect(
        healthTrainingTitleLink
          .getAttribute('href')
          .slice(0, healthTrainingTitleLink.getAttribute('href').indexOf(';')),
      ).toBe('/training/someHealthUid');
      expect(
        healthTraining2TitleLink
          .getAttribute('href')
          .slice(0, healthTraining2TitleLink.getAttribute('href').indexOf(';')),
      ).toBe('/training/someHealthUid2');
    });

    it('training title should not link to training records if you are a read only user', () => {
      component.canEditWorker = false;
      fixture.detectChanges();

      const autismTrainingTitleLink = fixture.debugElement.query(By.css('[data-testid="Title-no-link-someAutismUid"]'));
      const autismTraining2TitleLink = fixture.debugElement.query(
        By.css('[data-testid="Title-no-link-someAutismUid2"]'),
      );
      const communicationTrainingTitleLink = fixture.debugElement.query(
        By.css('[data-testid="Title-no-link-someCommunicationUid"]'),
      );
      const healthTrainingTitleLink = fixture.debugElement.query(By.css('[data-testid="Title-no-link-someHealthUid"]'));
      const healthTraining2TitleLink = fixture.debugElement.query(
        By.css('[data-testid="Title-no-link-someHealthUid2"]'),
      );

      expect(autismTrainingTitleLink).toBeTruthy();
      expect(autismTrainingTitleLink).toBeTruthy();
      expect(autismTraining2TitleLink).toBeTruthy();
      expect(communicationTrainingTitleLink).toBeTruthy();
      expect(healthTrainingTitleLink).toBeTruthy();
      expect(healthTraining2TitleLink).toBeTruthy();
    });
  });

  describe('no training', async () => {
    it('should display a no training found link when there is no training and isMandatoryTraining is false', async () => {
      component.trainingCategories = [];
      fixture.detectChanges();
      const noTrainingLink = fixture.debugElement.query(By.css('[data-testid="no-training-link"]')).nativeElement;

      expect(noTrainingLink).toBeTruthy();
      expect(noTrainingLink.getAttribute('href')).toBe('/add-training');
    });

    it('should display a no mandatory training found link when there is no mandatory training and isMandatoryTraining is true', async () => {
      component.trainingCategories = [];
      component.isMandatoryTraining = true;
      component.workplaceUid = '123';
      fixture.detectChanges();
      const noMandatoryTrainingLink = fixture.debugElement.query(
        By.css('[data-testid="no-mandatory-training-link"]'),
      ).nativeElement;
      expect(noMandatoryTrainingLink).toBeTruthy();
      expect(noMandatoryTrainingLink.getAttribute('href')).toBe('/workplace/123/add-and-manage-mandatory-training');
    });
  });
});
