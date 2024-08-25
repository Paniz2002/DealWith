import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class HeaderHeightService {
  private headerHeightSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public headerHeight$: Observable<number> = this.headerHeightSubject.asObservable();

  setHeaderHeight(height: number): void {
    this.headerHeightSubject.next(height);
  }
}
