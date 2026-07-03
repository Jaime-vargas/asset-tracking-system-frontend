import {Component, inject, signal} from '@angular/core';
import {DashboardBoxComponent} from '../../components/dasboard-box-component/dashboard-box.component';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from 'ng-zorro-antd/form';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';
import {form} from '@angular/forms/signals';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../../services/auth-service';
import {Router} from '@angular/router';
import {LoginResponse} from '../../interfaces/login-response.type';

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

  constructor(private http: HttpClient) {
  }

  router = inject(Router);
  service = inject(AuthService);
  token = signal<string>('');

  private fb: FormBuilder = inject(FormBuilder);
  protected loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  logInFormSubmit(){
    console.log("submit " + this.loginForm.getRawValue().name);
    console.log("password " + this.loginForm.getRawValue().password);
    this.http.post<LoginResponse>("http://localhost:3000/api/v1/login", this.loginForm.getRawValue())
      .subscribe({
      next: data => {

        console.log(data);
        this.token.set(data.token);
        this.service.setToken(data.token);
        this.router.navigate(['/dashboard']);
      }
    })
  }

}
