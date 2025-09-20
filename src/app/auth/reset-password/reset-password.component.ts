import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  token: string | null = null;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'] || null;
    if (!this.token) {
      this.errorMessage = 'Invalid or missing reset token. Please request a new password reset.';
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
    
    return null;
  }

  onSubmit() {
    if (this.resetPasswordForm.valid && this.token) {
      this.isLoading = true;
      this.successMessage = '';
      this.errorMessage = '';
      
      const { password } = this.resetPasswordForm.value;
      
      this.authService.resetPassword(this.token, password).subscribe({
        next: (result: { success: boolean; message?: string }) => {
          this.isLoading = false;
          if (result.success) {
            this.successMessage = result.message || 'Your password has been reset successfully. You can now sign in with your new password.';
          } else {
            this.errorMessage = result.message || 'Failed to reset password.';
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'An error occurred while resetting your password.';
        }
      });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}