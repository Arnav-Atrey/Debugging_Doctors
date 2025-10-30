import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeletedRecordsEventService {
  private recordDeletedSource = new Subject<void>();
  private recordRestoredSource = new Subject<void>();

  recordDeleted$ = this.recordDeletedSource.asObservable();
  recordRestored$ = this.recordRestoredSource.asObservable();

  notifyRecordDeleted(): void {
    this.recordDeletedSource.next();
  }

  notifyRecordRestored(): void {
    this.recordRestoredSource.next();
  }
}