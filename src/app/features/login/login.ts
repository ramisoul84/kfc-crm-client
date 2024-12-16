import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastContainer } from "../../shared/toast/toast";

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, ToastContainer],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit{
  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  returnUrl: string = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    // If already authenticated, redirect to dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Get return url from route parameters or default to '/dashboard'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (!res.manager.password_updated) {
          this.router.navigate(['/force-change-password']);
        } else if (!res.manager.is_active) {
          this.router.navigate(['/awaiting-activation']);
        } else {
          this.router.navigate([this.returnUrl]);
          this.toastService.success('Welcome back!', 'Login Successful');
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.toastService.error(
          this.getServerError(error),
          'Login Failed'
        );
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private getServerError(error: HttpErrorResponse): string {
    if (typeof error.error === 'object' && error.error !== null) {
      const msg = error.error.detail || error.error.message || error.error.error;
      if (msg) return msg;
    }
    if (typeof error.error === 'string' && error.error.length > 0) {
      return error.error;
    }
    if (error.status === 0) {
      return 'Unable to connect to server. Please check your connection.';
    }
    return 'Invalid email or password';
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (!control || !control.touched || !control.errors) return '';

    if (control.errors['required']) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
    }
    if (control.errors['email']) {
      return 'Please enter a valid email address';
    }
    if (control.errors['minlength']) {
      return `Password must be at least ${control.errors['minlength'].requiredLength} characters`;
    }

    return '';
  }
}
