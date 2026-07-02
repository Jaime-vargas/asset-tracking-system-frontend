import {ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';

import { NzModalModule }
  from 'ng-zorro-antd/modal';
import {authInterceptorService} from './services/auth-interceptor.service';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptorService])),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), provideNzI18n(en_US),
    importProvidersFrom(
      NzModalModule
    )
  ]
};
