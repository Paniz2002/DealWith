import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BidService {

  private apiUrl = 'http://your-api-endpoint.com/bids';

  constructor(private http: HttpClient) { }

  addBid(bid: any): Observable<any> {
    return this.http.post(this.apiUrl, bid);
  }
}
