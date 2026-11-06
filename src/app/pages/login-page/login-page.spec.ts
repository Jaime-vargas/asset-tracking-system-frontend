import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoginPage } from './login-page';
import { AuthService } from '../../services/auth-service';
describe('Login', () => {
  const auth = { setToken: vi.fn() };
  const router = { navigate: vi.fn() };
  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();
  });
  it('prevents duplicate submissions and recovers after a server error', () => {
    const fixture = TestBed.createComponent(LoginPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component['loginForm'].setValue({ username: 'tester', password: 'example-password' });
    component.logInFormSubmit();
    component.logInFormSubmit();
    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('/api/v1/login');
    expect(component.submitting()).toBe(true);
    req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();
    expect(component.submitting()).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Invalid credentials',
    );
    http.verify();
  });
  it('keeps the existing successful login destination', () => {
    const fixture = TestBed.createComponent(LoginPage);
    const component = fixture.componentInstance;
    component['loginForm'].setValue({ username: 'tester', password: 'example-password' });
    component.logInFormSubmit();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/v1/login').flush({ token: 'test-token' });
    expect(auth.setToken).toHaveBeenCalledWith('test-token');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component.submitting()).toBe(false);
    http.verify();
  });
});
