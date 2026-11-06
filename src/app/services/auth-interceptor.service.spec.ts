import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, expect, it } from 'vitest';
import { ApiUrlBaseService } from './api-url-base.service';
import { authInterceptorService } from './auth-interceptor.service';
import { AuthService } from './auth-service';

afterEach(() => localStorage.removeItem('token'));

it('sends the bearer only to the configured API origin and path', () => {
  localStorage.setItem('token', 'test-token');
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([authInterceptorService])),
      provideHttpClientTesting(),
      { provide: ApiUrlBaseService, useValue: { baseUrl: 'https://api.example/api/v1' } },
      { provide: AuthService, useValue: { isValidToken: () => true } },
    ],
  });
  const client = TestBed.inject(HttpClient);
  const requests = TestBed.inject(HttpTestingController);

  for (const [url, expected] of [
    ['https://api.example/api/v1/reports', 'Bearer test-token'],
    ['https://api.example/uploads/logo.png', null],
    ['https://api.example/api/v10/reports', null],
    ['https://other.example/api/v1/reports', null],
  ] as const) {
    client.get(url).subscribe();
    const request = requests.expectOne(url);
    expect(request.request.headers.get('Authorization')).toBe(expected);
    request.flush({});
  }
  requests.verify();
});
