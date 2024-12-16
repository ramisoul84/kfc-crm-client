import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    title?: string;
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toasts = new BehaviorSubject<Toast[]>([]);
    public toasts$ = this.toasts.asObservable();

    show(toast: Omit<Toast, 'id'>): void {
        const newToast: Toast = {
            ...toast,
            id: Date.now().toString(),
            duration: toast.duration || 5000
        };

        const currentToasts = this.toasts.value;
        this.toasts.next([...currentToasts, newToast]);

        if (newToast.duration! > 0) {
            setTimeout(() => this.remove(newToast.id), newToast.duration);
        }
    }

    success(message: string, title?: string): void {
        this.show({ type: 'success', message, title });
    }

    error(message: string, title?: string): void {
        this.show({ type: 'error', message, title });
    }

    warning(message: string, title?: string): void {
        this.show({ type: 'warning', message, title });
    }

    info(message: string, title?: string): void {
        this.show({ type: 'info', message, title });
    }

    remove(id: string): void {
        const currentToasts = this.toasts.value;
        this.toasts.next(currentToasts.filter(t => t.id !== id));
    }
}