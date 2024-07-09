import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { enviroments } from '../../../enviroments/enviroments';
import axios from 'axios';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {ActivatedRoute, Router} from '@angular/router';
import { NotificationService } from '../../services/popup/notification.service';
import { RegisterComponent } from '../register/register.component';
import { LocalStorageService } from '../../services/localStorage/localStorage.service';

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
  templateUrl: './updatepassowrd.html',
  styleUrl: '../register/register.component.css',
})
export class UpdatepasswordComponent implements OnInit {
  form!: FormGroup;
  isFormValid!: Boolean;
  id!: string | null ;

  constructor(
    private loginFormBuilder: FormBuilder,
    private router: Router,
    private snackBar: NotificationService,
    private localStorage: LocalStorageService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.isFormValid = false;
    this.id = this.route.snapshot.paramMap.get('id');
    if(!this.id){
        this.router.navigate(['/login']);
    }
    this.form = this.loginFormBuilder.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  get getPasswordErrors() {
    return RegisterComponent.getPasswordErrors;
  }

  get getPasswordConfirmErrors() {
    return RegisterComponent.getPasswordConfirmErrors;
  }

  async onSubmit() {
    if (
      RegisterComponent.getPasswordErrors(this.form) ||
      RegisterComponent.getPasswordConfirmErrors(this.form)
    ) {
      return;
    }
    const url = enviroments.BACKEND_URL + '/api/auth/password/';
    try {
      const data=this.form.value;
      data.id=this.id;
      const res = await axios.patch(url, data);
      if (res.status == 200) {
        return this.router.navigate(['/homepageRedirect']);
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
