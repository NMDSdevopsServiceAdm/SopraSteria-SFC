import { TestBed } from '@angular/core/testing';

import { PdfMakeService } from './pdf-make.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PdfMakeService', () => {
  let service: PdfMakeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PdfMakeService],
    });

    service = TestBed.inject(PdfMakeService);
  });

  describe('Mandatory Training', () => {
    it('should build a mandatory training section with headers and rows', () => {
      const input = [
        {
          category: 'Fire Safety',
          trainingRecords: [
            {
              title: 'Fire Drill',
              accredited: 'Yes',
              completed: '1 Jan 2023',
              expires: '1 Jan 2024',
              trainingCertificates: ['cert.pdf'],
            },
            { title: '', accredited: '', completed: null, expires: null, trainingCertificates: [] },
          ],
        },
      ];

      const result = service.mandatoryTrainingSection(input);

      expect(result.length).toBeGreaterThan(1);

      const header: any = result[0];
      expect(header.stack[0].text).toBe('Mandatory training');

      const categoryStack: any = result[1];
      expect(categoryStack.stack[0].text).toBe('Fire Safety');

      // table headers
      const table = categoryStack.stack[1].table;
      expect(table.body[0].map((h: any) => h.text)).toEqual([
        'Training name',
        'Accredited',
        'Completion date',
        'Expiry date',
        'Certificate',
      ]);

      // data row check
      expect(table.body[1]).toContain('Fire Drill');
      expect(table.body[1]).toContain('Yes');
      expect(table.body[1]).toContain('1 Jan 2023');
      expect(table.body[1]).toContain('1 Jan 2024');
      expect(table.body[1]).toContain('See download');
    });
  });

  describe('nonMandatory Training', () => {
    it('should build a non-mandatory training section with correct title', () => {
      const input = [
        {
          category: 'Optional Courses',
          trainingRecords: [
            {
              title: 'Excel Basics',
              accredited: 'No',
              completed: '1 Jan 2023',
              expires: '-',
              trainingCertificates: [],
            },
          ],
        },
      ];

      const result = service.nonMandatoryTrainingSection(input);
      expect(result.length).toBeGreaterThan(1);

      const header: any = result[0];
      expect(header.stack[0].text).toBe('Non-mandatory training');

      const categoryStack: any = result[1];
      expect(categoryStack.stack[0].text).toBe('Optional Courses');

      // table headers
      const table = categoryStack.stack[1].table;
      expect(table.body[0].map((h: any) => h.text)).toEqual([
        'Training name',
        'Accredited',
        'Completion date',
        'Expiry date',
        'Certificate',
      ]);

      // data row check
      expect(table.body[1]).toContain('Excel Basics');
      expect(table.body[1]).toContain('No');
      expect(table.body[1]).toContain('1 Jan 2023');
      expect(table.body[1]).toContain('-');
      expect(table.body[1]).toContain('No');
    });
  });

  describe('Qualification', () => {
    it('should build a qualifications section with correct headers and rows', () => {
      const input = {
        groups: [
          {
            group: 'IT',
            records: [
              { title: 'CompTI', year: '2020', qualificationCertificates: ['a.pdf'] },
              { title: 'Cisco CCNA', year: '', qualificationCertificates: [] },
            ],
          },
        ],
      };

      const result = service.qualificationSection(input);

      expect(result.length).toBeGreaterThan(1);

      const header: any = result[0];
      expect(header.stack[0].text).toBe('Qualifications');

      const categoryStack: any = result[1];
      expect(categoryStack.stack[0].text).toBe('IT');

      const headers = categoryStack.stack[1].table.body[0];
      const headerTexts = headers.map((h: any) => (h && typeof h === 'object' ? h.text : h ?? ''));

      expect(headerTexts).toEqual(['IT name', 'Year achieved', 'Certificate']);

      const firstRow = categoryStack.stack[1].table.body[1];
      expect(firstRow[0]).toBe('CompTI');
      expect(firstRow[1].text).toBe('2020');
      expect(firstRow[2].text).toBe('See download');
    });
  });
});
