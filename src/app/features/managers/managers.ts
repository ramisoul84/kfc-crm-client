import { Component, inject, OnInit } from '@angular/core';
import {  ProfileData } from '../../core/models/manager';
import { ManagerService } from '../../core/services/manager.servciec';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-managers',
  imports: [CommonModule],
  templateUrl: './managers.html',
  styleUrls: ['./managers.scss'],
})
export class Managers implements OnInit {
  managers: ProfileData[] = [];
  isLoading = true;
  error: string | null = null;

  private managerService = inject(ManagerService);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.error = null;

    this.managerService.getAllManagers().subscribe({
      next: (managers) => {
        this.managers = managers;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load managers:', error);
        this.isLoading = false;
        this.error = error.message || 'Failed to load managers';
      },
    });
  }

  roleLabel(role: string): string {
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      regional_manager: 'Regional Manager',
      restaurant_manager: 'Restaurant Manager',
      shift_supervisor: 'Shift Supervisor',
    };
    return labels[role] || role;
  }
}
