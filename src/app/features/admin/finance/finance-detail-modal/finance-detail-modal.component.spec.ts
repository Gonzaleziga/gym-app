import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceDetailModalComponent } from './finance-detail-modal.component';

describe('FinanceDetailModalComponent', () => {
  let component: FinanceDetailModalComponent;
  let fixture: ComponentFixture<FinanceDetailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceDetailModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinanceDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
