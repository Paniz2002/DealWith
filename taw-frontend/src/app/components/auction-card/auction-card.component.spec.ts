import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionCardComponent } from './auction-card.component';

describe('AuctionCardComponent', () => {
  let component: AuctionCardComponent;
  let fixture: ComponentFixture<AuctionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuctionCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuctionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
