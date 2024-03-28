import { TestBed } from '@angular/core/testing';

import { LocalstorageService } from './localstorare/localstorage.servicee';

describe('LocalstorageService', () => {
  let service: LocalstorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalstorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
