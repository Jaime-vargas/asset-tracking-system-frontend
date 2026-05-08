import {Component, input} from '@angular/core';
import {NzBreadCrumbComponent, NzBreadCrumbItemComponent} from "ng-zorro-antd/breadcrumb";
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-breadcrumb-component',
  imports: [
    NzBreadCrumbComponent,
    NzBreadCrumbItemComponent,
    RouterLink
  ],
  templateUrl: './breadcrumb-component.html',
  styleUrl: './breadcrumb-component.css',
})
export class BreadcrumbComponent {
  breadcrumb =
    input.required<{label:string | null, link?:(string|number|null)[]}[]>();
}
