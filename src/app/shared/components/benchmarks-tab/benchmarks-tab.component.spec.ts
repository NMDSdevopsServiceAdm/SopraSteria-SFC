import { Establishment } from '../../../../mockdata/establishment';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { BenchmarksTabComponent } from '@shared/components/benchmarks-tab/benchmarks-tab.component';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { MockBenchmarksService } from '@core/test-utils/MockBenchmarkService';


fdescribe('BenchmarksTabComponent', () => {
      let component: BenchmarksTabComponent;
      let fixture: ComponentFixture<BenchmarksTabComponent>;

      beforeEach(async(() => {
        TestBed.configureTestingModule({
          imports: [RouterTestingModule, HttpClientTestingModule],
          declarations: [],
          providers:[{ provide: BenchmarksService, useClass: MockBenchmarksService}]
        }).compileComponents();
      }));

      beforeEach(() => {
        fixture = TestBed.createComponent(BenchmarksTabComponent);
        component = fixture.componentInstance;
        component.workplace = Establishment;
        fixture.detectChanges();
      });

      it('should create', () => {
        expect(component).toBeTruthy();
      });
});
