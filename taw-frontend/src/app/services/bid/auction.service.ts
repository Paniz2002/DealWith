import {Injectable} from '@angular/core';
import axios from 'axios';
import {environments} from "../../../environments/environments";
import {FormGroup} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class AuctionService {
  private apiUrl = environments.BACKEND_URL;

  constructor() {
  }

  addAuction(auctionForm: FormGroup) {
    return axios.post(`${this.apiUrl}/api/auction`, auctionForm.value)
      .then(res => res.data)
      .catch(err => {
        console.error('Error adding auction:', err);
        return false;
      });
  }

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

  async addBook(form_body: object) {
    try {
      const res = await axios.post(`${this.apiUrl}/api/books`, form_body);
      return res.data;
    } catch (err) {
      return null;
    }
  }

  addCourse(form_body: object) {
    return axios.post(`${this.apiUrl}/api/courses`, form_body)
      .then(res => res.data)
      .catch(err => {
        return null;
      });
  }
}
