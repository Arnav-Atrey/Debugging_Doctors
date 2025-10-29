import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-captcha',
  templateUrl: './captcha.html',
  styleUrls: ['./captcha.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CaptchaComponent implements OnInit {
  captchaCode: string = '';
  userInput: string = '';
  @Output() captchaValidated = new EventEmitter<boolean>();
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.generateCaptcha();
  }

  generateCaptcha(): void {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    this.captchaCode = Array(6)
      .fill('')
      .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
      .join('');

    const canvas = document.getElementById('captchaCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
        ctx.stroke();
      }

      for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 2,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
        ctx.fill();
      }

      ctx.font = '24px Arial';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < this.captchaCode.length; i++) {
        const x = 20 + i * 30;
        const y = canvas.height / 2 + (Math.random() * 10 - 5);
        ctx.fillText(this.captchaCode[i], x, y);
      }
    }
  }

  // This method is called whenever the user types in the input field
  onInputChange(): void {
    if (!this.userInput) {
      this.errorMessage = null;
      this.captchaValidated.emit(false);
      return;
    }
    
    // Auto-validate as user types
    if (this.userInput.length === this.captchaCode.length) {
      this.validateCaptcha();
    } else {
      // Reset validation if length doesn't match
      this.captchaValidated.emit(false);
    }
  }

  validateCaptcha(): void {
    if (!this.userInput) {
      this.errorMessage = 'Please enter the CAPTCHA code.';
      this.captchaValidated.emit(false);
      return;
    }
    if (this.userInput.toUpperCase() === this.captchaCode.toUpperCase()) {
      this.errorMessage = null;
      this.captchaValidated.emit(true);
    } else {
      this.errorMessage = 'Invalid CAPTCHA code. Please try again.';
      this.captchaValidated.emit(false);
      this.userInput = ''; // Clear the input
      this.generateCaptcha(); // Generate new captcha
    }
  }

  refreshCaptcha(): void {
    this.userInput = '';
    this.errorMessage = null;
    this.captchaValidated.emit(false);
    this.generateCaptcha();
  }
}