import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ToastContainer } from '../../shared/toast/toast';

@Component({
  selector: 'app-force-change-password',
  imports: [ReactiveFormsModule, ToastContainer],
  templateUrl: './force-change-password.html',
  styleUrls: ['./force-change-password.scss']
})
export class ForceChangePassword {
  form: FormGroup;
  isLoading = false;
  showOldPassword = false;
  showNewPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    const user = this.authService.getCurrentManager();
    if (!user || user.password_updated) {
      this.router.navigate(['/dashboard']);
    }
    this.form = this.fb.group({
      old_password: ['', [Validators.required]],
      new_password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isLoading = true;
    const { old_password, new_password } = this.form.value;
    this.authService.changePassword(old_password, new_password).subscribe({
      next: () => {
        this.isLoading = false;
        this.authService.updateCurrentManager({ password_updated: true });
        this.router.navigate(['/awaiting-activation']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        const msg = typeof err.error === 'object' && err.error !== null
          ? err.error.error || err.error.message || 'Failed to change password'
          : 'Failed to change password';
        this.toastService.error(msg, 'Error');
      }
    });
  }

  toggleOldPassword(): void {
    this.showOldPassword = !this.showOldPassword;
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }
}
