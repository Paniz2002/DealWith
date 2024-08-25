import { TestBed } from '@angular/core/testing';

import { HeaderHeightService } from './header-height.service';

describe('HeaderHeightService', () => {
  let service: HeaderHeightService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeaderHeightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
