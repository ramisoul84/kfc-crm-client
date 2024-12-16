import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Toast, ToastService } from '../../core/services/toast.service';


@Component({
  selector: 'app-toast-container',
  imports: [
    CommonModule
  ],
  templateUrl: './toast.html',
  styleUrls: ['./toast.scss'],
})
export class ToastContainer implements OnInit {
  toasts$: Observable<Toast[]>;

  constructor(private toastService: ToastService) {
    this.toasts$ = this.toastService.toasts$;
  }

  ngOnInit(): void { }

  removeToast(id: string): void {
    this.toastService.remove(id);
  }

  getToastIcon(type: string): string {
    const icons = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    return icons[type as keyof typeof icons] || 'info';
  }
}