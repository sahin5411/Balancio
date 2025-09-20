import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  signupForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const formData = this.signupForm.value;
      const userData = {
        ...formData,
        email: formData.email.toLowerCase()
      };
      
      this.authService.signup(userData).subscribe({
        next: (result) => {
          this.isLoading = false;
          if (result.success) {
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = result.message || 'Signup failed';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'An error occurred during signup';
        }
      });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  signupWithGoogle() {
    // Implementation would go here
  }

  signupWithGitHub() {
    // Implementation would go here
  }
}