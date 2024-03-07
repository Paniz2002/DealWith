import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import axios from 'axios';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  // Bypassing compiler error with this simple trick
  // instead of changing tsconfig.json
  // 99.9% of companies will hate you, but
  // we know that this registerForm WILL get initialized
  // from the constructor.
  registerForm!: FormGroup;
  constructor(private registerFormBuilder: FormBuilder) {
    this.createRegisterForm();
  }

  createRegisterForm() {
    this.registerForm = this.registerFormBuilder.group({
      name: [''],
      email: [''],
      password: [''],
      confirmPassword: [''],
      role: [''],
    });
  }
  onSubmit() {
    console.log(this.registerForm.get('name')?.value);
  }
}
