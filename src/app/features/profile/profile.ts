// features/profile/profile.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { ProfileData } from '../../core/models/manager';
import { ManagerService } from '../../core/services/manager.servciec';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
})
export class Profile implements OnInit {
  profile: ProfileData | null = null;
  isLoading = true;

  isEditing = false;
  profileForm!: FormGroup;
  isSavingProfile = false;

  passwordForm!: FormGroup;
  isSavingPassword = false;

  private managerService = inject(ManagerService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  get roleLabel(): string {
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      regional_manager: 'Regional Manager',
      restaurant_manager: 'Restaurant Manager',
      shift_supervisor: 'Shift Supervisor',
    };
    return this.profile ? labels[this.profile.role] || this.profile.role : '';
  }

  ngOnInit(): void {
    this.initForms();
    this.loadProfile();
  }

  private initForms(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
    });

    this.passwordForm = this.fb.group(
      {
        old_password: ['', [Validators.required, Validators.minLength(8)]],
        new_password: ['', [Validators.required, Validators.minLength(8)]],
        confirm_password: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('new_password')?.value;
    const confirmPassword = form.get('confirm_password')?.value;

    if (newPassword !== confirmPassword) {
      form.get('confirm_password')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  loadProfile(): void {
    this.isLoading = true;

    this.managerService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.profileForm.patchValue({
          name: profile.name,
          email: profile.email,
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load profile:', error);
        this.isLoading = false;
        this.toast.error(error.message || 'Failed to load profile');
      },
    });
  }

  startEditing(): void {
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.isEditing = false;

    if (this.profile) {
      this.profileForm.patchValue({
        name: this.profile.name,
        email: this.profile.email,
      });
    }

    this.profileForm.markAsPristine();
    this.profileForm.markAsUntouched();
  }

  saveProfile(): void {
    if (this.profileForm.invalid || this.isSavingProfile) return;

    const raw = this.profileForm.getRawValue();

    const data: { name?: string; email?: string } = {};

    if (raw.name !== this.profile?.name) {
      data.name = raw.name;
    }
    if (raw.email !== this.profile?.email) {
      data.email = raw.email;
    }

    if (Object.keys(data).length === 0) {
      this.isEditing = false;
      return;
    }

    this.isSavingProfile = true;

    this.managerService.updateProfile(data).subscribe({
      next: (updatedProfile) => {
        this.profile = updatedProfile;
        this.profileForm.patchValue({
          name: updatedProfile.name,
          email: updatedProfile.email,
        });
        this.isEditing = false;
        this.isSavingProfile = false;
        this.profileForm.markAsPristine();
        this.toast.success('Profile updated successfully');
      },
      error: (error) => {
        this.isSavingProfile = false;
        this.toast.error(error.message || 'Failed to update profile');
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid || this.isSavingPassword) return;

    const raw = this.passwordForm.getRawValue();

    if (raw.new_password !== raw.confirm_password) {
      this.toast.error('Passwords do not match');
      return;
    }

    this.isSavingPassword = true;

    this.managerService.changePassword(raw.old_password, raw.new_password).subscribe({
      next: () => {
        this.isSavingPassword = false;
        this.passwordForm.reset();
        this.passwordForm.markAsPristine();
        this.passwordForm.markAsUntouched();
        this.toast.success('Password changed successfully');
      },
      error: (error) => {
        this.isSavingPassword = false;
        this.toast.error(error.message || 'Failed to change password');
      },
    });
  }
}