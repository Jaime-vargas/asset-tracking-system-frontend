import {Component, computed, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {inject} from '@angular/core';
import {ClientService} from '../../services/client.service';
import {BranchTableDto} from '../../interfaces/branch-table.dto';
import {DasboardBoxComponent} from '../../components/dasboard-box-component/dasboard-box-component';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzTableComponent, NzThMeasureDirective} from 'ng-zorro-antd/table';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzEmptyComponent} from 'ng-zorro-antd/empty';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {FormsModule} from '@angular/forms';
import {NzInputDirective, NzInputPrefixDirective, NzInputWrapperComponent} from 'ng-zorro-antd/input';
import {UtilityService} from '../../services/utility.service';
import {RouteContextService} from '../../services/route-context.service';

@Component({
  selector: 'app-client-branches-page',
  imports: [
    DasboardBoxComponent,
    NzButtonComponent,
    NzIconDirective,
    NzTableComponent,
    NzTagComponent,
    NzThMeasureDirective,
    NzDividerComponent,
    NzEmptyComponent,
    NzFlexDirective,
    FormsModule,
    NzInputDirective,
    NzInputPrefixDirective,
    NzInputWrapperComponent,
    RouterLink
  ],
  templateUrl: './client-branches-page.html',
  styleUrl: './client-branches-page.css',
})
export class ClientBranchesPage {

  route: ActivatedRoute = inject(ActivatedRoute);

  constructor(private clientService: ClientService, protected utilityService: UtilityService) {
    const id = this.route.snapshot.paramMap.get('id');
    const slug = this.route.snapshot.paramMap.get('slug');
    this.clientId.set(Number(id));
    this.clientSlug.set(slug ?? '');
    this.getBranches();
  }

  clientId = signal<number>(0);
  clientSlug = signal('');

  // TABLE DATA
  branchesData = signal<BranchTableDto[]>([]);
  branches = computed(() => {
    const now = new Date();
    return this.branchesData().map((branch) => {
      const totalReports = branch.reportsActive.length;
      const overdueReports = branch.reportsActive.filter(report =>
        new Date(report.dueDate) < now
      ).length;
      return {
        ...branch,
        reportsActive: totalReports - overdueReports,
        overdueReports
      };
    })
  });
  branchNameFilter = signal<string>('');
  branchesTable = computed(()=> {
      return this.branches().filter(branch => {
        return branch.name.toLowerCase().includes(this.branchNameFilter().toLowerCase());
      })
  })

  getBranches() {
    return this.clientService.getBranches(this.clientId()).subscribe({
      next: data => {
        this.branchesData.set(data);
      }
    })
  }
}
