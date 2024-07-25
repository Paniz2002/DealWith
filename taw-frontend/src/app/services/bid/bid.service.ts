import {Injectable} from '@angular/core';
import axios from 'axios';
import {enviroments} from "../../../enviroments/enviroments";
import {FormGroup} from "@angular/forms";

@Injectable({
  providedIn: 'root'
})
export class BidService {

  private apiUrl = enviroments.BACKEND_URL + '/api/new-listing';

  constructor() {
  }

  addBid(bid: FormGroup) {
    axios.post(this.apiUrl, bid.value).then((res) => {
      return res;
    }).catch((e) => {
      return false
    });
  }
}
