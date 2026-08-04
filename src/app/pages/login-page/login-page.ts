import {Component, Inject, inject, signal} from '@angular/core';
import {DashboardBoxComponent} from '../../components/dasboard-box-component/dashboard-box.component';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from 'ng-zorro-antd/form';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../../services/auth-service';
import {Router} from '@angular/router';
import {LoginResponse} from '../../interfaces/login-response.type';
import {ApiUrlBaseService} from '../../services/api-url-base.service';

@Component({
  selector: 'app-login-page',
  imports: [
    DashboardBoxComponent,
    FormsModule,
    NzButtonComponent,
    NzDividerComponent,
    NzFlexDirective,
    NzFormControlComponent,
    NzFormDirective,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzInputDirective,
    ReactiveFormsModule,
    NzTypographyComponent
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {

  apiService = inject(ApiUrlBaseService)
  authService = inject(AuthService);
  httpClient = inject(HttpClient);
  router = inject(Router);

  private fb: FormBuilder = inject(FormBuilder);
  protected loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', [Validators.required]]
  });

  loginResponseError = signal<string>("");

  logInFormSubmit(){

    this.httpClient.post<LoginResponse>(
      this.apiService.baseUrl + "/login",
      this.loginForm.getRawValue()
    )
      .subscribe({
        next: data => {
          this.authService.setToken(data.token);
          this.router.navigate(['/dashboard']);
      },
        error: err => {
          this.loginResponseError.set(err.error.message)
        }
    })
  }
}
