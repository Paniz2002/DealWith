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

  //region books
  async getBooks(to_search: string) {
    try {
      let res;
      if (to_search && to_search !== '' && to_search.length > 0) {
        res = await axios.get(`${this.apiUrl}/api/books`, {params: {q: to_search}});
      } else {
        res = await axios.get(`${this.apiUrl}/api/books`);
      }
      return res.data;
    } catch (err) {
      console.error('Error fetching books:', err);
      return [];
    }
  }

  async addBook(form_body: object) {
    try {
      const res = await axios.post(`${this.apiUrl}/api/books`, form_body);
      return res.data;
    } catch (err) {
      return null;
    }
  }
  //endregion

  //region courses
  async getCourses(to_search: string) {
    try {
      let res;
      if (to_search && to_search !== '' && to_search.length > 0) {
        res = await axios.get(`${this.apiUrl}/api/courses`, {params: {q: to_search}});
      } else {
        res = await axios.get(`${this.apiUrl}/api/courses`);
      }
      return res.data;
    } catch (err) {
      console.error('Error fetching courses:', err);
      return [];
    }
  }

  addCourse(form_body: object) {
    return axios.post(`${this.apiUrl}/api/course`, form_body)
      .then(res => res.data)
      .catch(err => {
        return null;
      });
  }
  //endregion


}
