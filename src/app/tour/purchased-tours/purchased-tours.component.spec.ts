import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasedToursComponent } from './purchased-tours.component';

describe('PurchasedToursComponent', () => {
  let component: PurchasedToursComponent;
  let fixture: ComponentFixture<PurchasedToursComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PurchasedToursComponent]
    });
    fixture = TestBed.createComponent(PurchasedToursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
