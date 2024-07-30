import {Injectable} from '@angular/core';
import axios from 'axios';
import {enviroments} from "../../../enviroments/enviroments";
import {FormGroup} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class AuctionService {
  private apiUrl = enviroments.BACKEND_URL;

  constructor() {
  }

  addAuction(auctionForm: FormGroup) {
    return axios.post(`${this.apiUrl}/api/listing`, auctionForm.value)
      .then(res => res.data)
      .catch(err => {
        console.error('Error adding auction:', err);
        return false;
      });
  }

  async getBooks(to_search: string) {
    try {
      let res;
      if (to_search && to_search!=='' && to_search.length > 0) {
        res = await axios.get(`${this.apiUrl}/api/books/`+to_search);

        console.log(res.data);
      } else {
        res = await axios.get(`${this.apiUrl}/api/books`);
        console.log(res.data);
      }
      return res.data;
    } catch (err) {
      console.error('Error fetching books:', err);
      return [];
    }
  }

  getCourses() {
    return axios.get(`${this.apiUrl}/api/course`)
      .then(res => res.data)
      .catch(err => {
        console.error('Error fetching courses:', err);
        return [];
      });
  }

  addBook(name: string) {
    return axios.post(`${this.apiUrl}/api/book`, {name})
      .then(res => res.data)
      .catch(err => {
        console.error('Error adding book:', err);
        return null;
      });
  }

  addCourse(name: string) {
    return axios.post(`${this.apiUrl}/api/course`, {name})
      .then(res => res.data)
      .catch(err => {
        console.error('Error adding course:', err);
        return null;
      });
  }
}
