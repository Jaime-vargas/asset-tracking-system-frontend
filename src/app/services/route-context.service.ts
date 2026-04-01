import { Injectable, signal } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RouteContextService {

  clientId = signal<number | null>(null);
  clientSlug = signal<string | null>(null);
  branchId = signal<number | null>(null);
  branchSlug = signal<string | null>(null);
  hardwareId = signal<number | null>(null);
  hardwareSlug = signal<string | null>(null);
  reportId = signal<number | null>(null);

  setFromRoute(route: ActivatedRoute){
    const params = route.snapshot.params;

    this.clientId.set(params['clientId'] ? Number(params['clientId']) : null);
    this.clientSlug.set(params['clientSlug'] ?? null);
    this.branchId.set(params['branchId'] ? Number(params['branchId']) : null);
    this.branchSlug.set(params['branchSlug'] ?? null);
    this.hardwareId.set(params['hardwareId'] ? Number(params['hardwareId']) : null);
    this.hardwareSlug.set(params['hardwareSlug'] ?? null);
    this.reportId.set(params['reportId'] ? Number(params['reportId']) : null);
  }
}
