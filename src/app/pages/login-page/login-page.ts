import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import {
  NzFormControlComponent,
  NzFormDirective,
  NzFormItemComponent,
  NzFormLabelComponent,
} from 'ng-zorro-antd/form';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { LoginResponse } from '../../interfaces/login-response.type';
import { ApiUrlBaseService } from '../../services/api-url-base.service';
@Component({
  selector: 'app-login-page',
  imports: [
    NzButtonComponent,
    NzFormControlComponent,
    NzFormDirective,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzInputDirective,
    ReactiveFormsModule,
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  private apiService = inject(ApiUrlBaseService);
  private authService = inject(AuthService);
  private httpClient = inject(HttpClient);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  protected loginForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
  loginResponseError = signal('');
  submitting = signal(false);
  logInFormSubmit() {
    if (this.loginForm.invalid || this.submitting()) return;
    this.loginResponseError.set('');
    this.submitting.set(true);
    this.httpClient
      .post<LoginResponse>(this.apiService.baseUrl + '/login', this.loginForm.getRawValue())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (data) => {
          this.authService.setToken(data.token);
          this.router.navigate(['/dashboard']);
        },
        error: (err) =>
          this.loginResponseError.set(
            typeof err.error?.message === 'string'
              ? err.error.message
              : 'Unable to sign in. Please try again.',
          ),
      });
  }
}
