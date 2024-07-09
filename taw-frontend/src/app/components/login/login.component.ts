import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {enviroments} from '../../../enviroments/enviroments';
import axios from 'axios';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {NavigationExtras, Router} from '@angular/router';
import {NotificationService} from '../../services/popup/notification.service';
import {RegisterComponent} from '../register/register.component';
import {LocalStorageService} from '../../services/localStorage/localStorage.service';
import {jwtDecode} from "jwt-decode";
import {JwtPayload} from "jsonwebtoken";

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
  ],
  templateUrl: './login.component.html',
  styleUrl: '../register/register.component.css',
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  isFormValid!: Boolean;

  constructor(
    private loginFormBuilder: FormBuilder,
    private router: Router,
    private snackBar: NotificationService,
    private localStorage: LocalStorageService,
  ) {
  }

  ngOnInit() {
    this.isFormValid = false;
    this.form = this.loginFormBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  get getUsernameErrors() {
    return RegisterComponent.getUsernameErrors;
  }

  private getDecodedAccessToken(token: string): any {
    try {
      return jwtDecode<JwtPayload>(token);
    } catch (Error) {
      return null;
    }
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
    const url = enviroments.BACKEND_URL + '/api/auth/login';
    try {
      const res = await axios.post(url, this.form.value);
      if (res.status == 200) {
        this.localStorage.set('jwt', res.data.token as string);
        let json_data = this.getDecodedAccessToken(res.data.token as string);
        const navigationExtras: NavigationExtras = {
          state: {token: res.data.token}
        };
        console.log(json_data);
        console.log(this.router)
        if (json_data.needs_update === true) {
          console.log("Moderaotr needs update")
         let x=  await this.router.navigate(['/updatepassword/' + res.data.id], navigationExtras); //FIXME: does not redciret to page
          console.log(x)
        }
        console.log("CAN ACCESS");
        return await this.router.navigate(['/homepageRedirect'], navigationExtras); //FIXME: does not redciret to page

      }
    } catch (e) {
      if (axios.isAxiosError(e)) {
        this.snackBar.notify(e.response?.data.message);
      }
    }
    return true;
  }

  resetForm() {
    this.form.reset({
      username: '',
      password: '',
    });
  }
}
