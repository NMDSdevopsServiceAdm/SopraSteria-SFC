import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FileValidateStatusComponent } from './file-validate-status.component';

describe('FileValidateStatusComponent', () => {
  let component: FileValidateStatusComponent;
  let fixture: ComponentFixture<FileValidateStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileValidateStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileValidateStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
