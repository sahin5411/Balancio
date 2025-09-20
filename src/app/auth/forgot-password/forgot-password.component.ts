import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.successMessage = '';
      this.errorMessage = '';
      
      const { email } = this.forgotPasswordForm.value;
      const emailLower = email.toLowerCase();
      
      this.authService.forgotPassword(emailLower).subscribe({
        next: (result: { success: boolean; message?: string }) => {
          this.isLoading = false;
          if (result.success) {
            this.successMessage = result.message || 'Password reset instructions have been sent to your email.';
          } else {
            this.errorMessage = result.message || 'Failed to send password reset instructions.';
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'An error occurred while sending password reset instructions.';
        }
      });
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}