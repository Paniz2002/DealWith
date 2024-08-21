import { Component } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { inject } from '@angular/core';
import axios from 'axios';
import { environments } from '../../../environments/environments';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatError } from '@angular/material/form-field';
@Component({
  selector: 'app-reply-dialog',
  standalone: true,
  imports: [MatError, ReactiveFormsModule],
  templateUrl: './reply-dialog.component.html',
  styleUrl: './reply-dialog.component.css',
})
export class ReplyDialogComponent {
  protected data = inject(MAT_DIALOG_DATA);
  form: FormGroup = new FormGroup({
    text: new FormControl('', [Validators.required]),
  });

  protected async submitReply() {
    const res = await axios.post(
      environments.BACKEND_URL +
        '/api/auctions/' +
        this.data.auctionID +
        '/comments/',
      {
        text: this.form.value.text,
        replyTo: this.data.replyTo,
        isPrivate: this.data.isPrivate ? true : null,
      },
    );
    if (res.status === 200) {
    }
  }
}
