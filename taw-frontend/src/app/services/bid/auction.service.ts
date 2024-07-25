import { Injectable } from '@angular/core';
import axios from 'axios';
import {enviroments} from "../../../enviroments/enviroments";
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class AuctionService {
  private apiUrl = enviroments.BACKEND_URL;

  constructor() { }

  addAuction(auctionForm: FormGroup) {
    return axios.post(`${this.apiUrl}/api/listing`, auctionForm.value)
      .then(res => res.data)
      .catch(err => {
        console.error('Error adding auction:', err);
        return false;
      });
  }

  getBooks() {
    return axios.get(`${this.apiUrl}/api/book`)
      .then(res => res.data)
      .catch(err => {
        console.error('Error fetching books:', err);
        return [];
      });
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
    return axios.post(`${this.apiUrl}/api/book`, { name })
      .then(res => res.data)
      .catch(err => {
        console.error('Error adding book:', err);
        return null;
      });
  }

  addCourse(name: string) {
    return axios.post(`${this.apiUrl}/api/course`, { name })
      .then(res => res.data)
      .catch(err => {
        console.error('Error adding course:', err);
        return null;
      });
  }
}
