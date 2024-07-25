import {Injectable} from '@angular/core';
import axios from 'axios';
import {enviroments} from "../../../enviroments/enviroments";
import {FormGroup} from "@angular/forms";

@Injectable({
  providedIn: 'root'
})
export class AuctionService {

  private apiUrl = enviroments.BACKEND_URL + '/api/new-listing';

  constructor() {
  }

  addAuction(auctionForm: FormGroup) {
    axios.post(this.apiUrl, auctionForm.value).then((res) => {
      return res;
    }).catch((e) => {
      return false
    });
  }
}
