import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { environments } from '../../../environments/environments';
import axios from 'axios';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {Router, RouterLink} from '@angular/router';
import { NotificationService } from '../../services/popup/notification.service';
import { RegisterComponent } from '../register/register.component';
import { LocalStorageService } from '../../services/localStorage/localStorage.service';

import { SocketService } from '../../socket.service';
import {HeaderHeightService} from "../../services/header/header-height.service";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrl: '../register/register.component.css',
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  isFormValid!: Boolean;
  loginHeight: string = '100vh';
  constructor(
    private loginFormBuilder: FormBuilder,
    private router: Router,
    private snackBar: NotificationService,
    private localStorage: LocalStorageService,
    private socketService: SocketService,
    private headerHeightService: HeaderHeightService
  ) {}

  ngOnInit() {
    this.headerHeightService.headerHeight$.subscribe((height) => {
      this.loginHeight = `calc(100vh - ${height}px)`;
    });

    this.isFormValid = false;
    this.form = this.loginFormBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  get getUsernameErrors() {
    return RegisterComponent.getUsernameErrors;
  }

  get getPasswordErrors() {
    return RegisterComponent.getPasswordErrors;
  }

  async onSubmit() {
    if (
      RegisterComponent.getPasswordErrors(this.form) ||
      RegisterComponent.getUsernameErrors(this.form)
    ) {
      return;
    }
    const url = environments.BACKEND_URL + '/api/auth/login';
    try {
      const res = await axios.post(url, this.form.value, {
        withCredentials: true,
      });
      if (res.status !== 200 || !res.data) {
        return;
      }
      if (!res.data._id) {
        console.log('No user id found');
        return;
      }

      this.socketService.joinRoom(res.data._id);
      this.socketService.sendMessage(res.data._id, 'User has logged in');

      this.localStorage.set('notification', res.data.notification);
      if (!res.data.is_moderator) {
        return await this.router.navigate(['/']);
      }

      if (res.data.is_moderator && res.data.needs_update) {
        return await this.router.navigate(['/updatepassword']);
      }

      return await this.router.navigate(['/admin']);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        this.snackBar.notify(e.response?.data.message);
      }
    }
    return false;
  }

  resetForm() {
    this.form.reset({
      username: '',
      password: '',
    });
  }
}

export function requestLogin() {}
