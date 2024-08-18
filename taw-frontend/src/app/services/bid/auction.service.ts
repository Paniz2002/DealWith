import {Injectable} from '@angular/core';
import axios from 'axios';
import {environments} from "../../../environments/environments";
import {FormGroup} from '@angular/forms';
import {NotificationService} from "../popup/notification.service";


@Injectable({
  providedIn: 'root'
})
export class AuctionService {
  private apiUrl = environments.BACKEND_URL;

  constructor(private snackBar: NotificationService) {
  }

  addAuction(auctionForm: FormGroup) {
    return axios.post(`${this.apiUrl}/api/auctions`, auctionForm.value)
      .then(res => res.data)
      .catch(err => {
        console.error('Error adding auction:', err);
        if (err.response.data.message) {
          this.snackBar.notify(err.response.data.message);
        } else {
          this.snackBar.notify('Error adding auction');
        }
        return false;
      });
  }

  uploadImages(auctionId: string, files: File[]) {
    const formData = new FormData();
    for (let file of files) {
      formData.append('images', file);
    }

    formData.set('auction_id', auctionId);
    return axios.post(`${this.apiUrl}/api/auctions/images`, formData)
      .then(res => res.data)
      .catch(err => {
        console.error('Error uploading images:', err);
        if (err.response.data.message) {
          this.snackBar.notify(err.response.data.message);
        } else {
          this.snackBar.notify('Error uploading images');
        }
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
      this.snackBar.notify('Error fetching books');
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
      this.snackBar.notify('Error fetching courses');
      console.error('Error fetching courses:', err);
      return [];
    }
  }

  async addBook(form_body: object) {
    try {
      const res = await axios.post(`${this.apiUrl}/api/books`, form_body);
      return res.data;
    } catch (err) {
      this.snackBar.notify('Error adding book');
      return null;
    }
  }

}
