import {Component, computed, OnDestroy, OnInit, signal} from '@angular/core';
import {BranchService} from '../../../services/branch.service';
import {SidebarStore} from '../../../store/sidebar.store';
import {BranchStore} from '../../../store/branch.store';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {Subscription} from 'rxjs';
import {ClientTableDto} from '../../../interfaces/client-table.dto';

@Component({
  selector: 'app-branch-form',
  imports: [],
  templateUrl: './branch-form.html',
  styleUrl: './branch-form.css',
})
export class BranchForm implements OnInit, OnDestroy {
  constructor(private branchService: BranchService,
              private branchStore: BranchStore,
              private message : NzMessageService,
              private notification : NzNotificationService,
              private sidebarStore: SidebarStore) {
  }
  private subscriptions: Subscription = new Subscription();
  ngOnInit() {}
  ngOnDestroy() {}

  branchToEdit = signal<ClientTableDto | null>(null);
  formMode = signal<string>("add")

  formTitle= computed(()=>
    this.formMode() === "add" ? "New Client" : "Update Client"
  )
}
