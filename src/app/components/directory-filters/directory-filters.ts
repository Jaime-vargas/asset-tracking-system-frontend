import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DirectoryOption } from '../../interfaces/directory';
import { UiIcon } from '../ui-icon/ui-icon';
@Component({
  selector: 'app-directory-filters', imports: [
    FormsModule, UiIcon
  ], template: `
<div class="scope-filters">
<label class="filter-field search-field"><span>Search</span><div class="search-control"><app-ui-icon name="search"/><input aria-label="Search" type="search" [placeholder]="placeholder()" [ngModel]="search()" (ngModelChange)="searchChange.emit($event)"/></div></label>
<label class="filter-field"><span>Client</span><select aria-label="Client" [ngModel]="clientId()" (ngModelChange)="clientChange.emit($event)"><option [ngValue]="null">All clients</option>@for (item of clients();track item.id){<option [ngValue]="item.id">{{item.name}}</option>}</select></label>
<label class="filter-field"><span>Site</span><select aria-label="Site" [ngModel]="siteId()" (ngModelChange)="siteChange.emit($event)"><option [ngValue]="null">All sites</option>@for (item of sites();track item.id){<option [ngValue]="item.id">{{item.name}}</option>}</select></label>
<ng-content/>
</div>`, styleUrls: [
    '../../styles/native-controls.css'
  ], styles: `.scope-filters{display:flex;flex-wrap:wrap;align-items:end;gap:10px}.search-field{flex:2;min-width:220px}.scope-filters>.filter-field:not(.search-field){flex:1;min-width:140px}@media(max-width:600px){.search-field{flex-basis:100%;min-width:0}.scope-filters>.filter-field:not(.search-field){min-width:0;flex-basis:calc(50% - 5px)}}`
})
export class DirectoryFilters {
  search = input('');
  placeholder = input('Search...');
  clientId = input<number | null>(null);
  siteId = input<number | null>(null);
  clients = input<DirectoryOption[]>([]);
  sites = input<DirectoryOption[]>([]);
  searchChange = output<string>();
  clientChange = output<number | null>();
  siteChange = output<number | null>();
}
