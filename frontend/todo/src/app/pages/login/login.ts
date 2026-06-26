
import { Component, inject, AfterViewInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements AfterViewInit {
  @ViewChild('googleBtnContainer') googleBtnContainer!: ElementRef;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  modoAtual: 'entrar' | 'cadastrar' = 'entrar';
  senhaVisivel = false;
  carregando = false;
  erro = '';

  formulario: FormGroup = this.fb.group({
    nome: [''],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngAfterViewInit(): void {
    this.inicializarGoogle();
  }

  private inicializarGoogle(): void {
    if (typeof google !== 'undefined') {
      this.configurarGoogle();
    } else {
      const script = document.querySelector('script[src*="accounts.google.com"]');
      if (script) {
        script.addEventListener('load', () => this.configurarGoogle());
      }
    }
  }

  private configurarGoogle(): void {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => this.ngZone.run(() => this.lidarComLoginGoogle(response)),
      use_fedcm_for_prompt: false
    });
    if (this.googleBtnContainer?.nativeElement) {
      google.accounts.id.renderButton(this.googleBtnContainer.nativeElement, {
        type: 'standard',
        size: 'large'
      });
    }
  }

  lidarComLoginGoogle(response: any): void {
    if (!response.credential) return;
    this.carregando = true;
    this.erro = '';
    this.authService.loginComGoogle(response.credential).subscribe({
      next: () => this.router.navigate(['/home']),
      error: () => {
        this.erro = 'erro ao autenticar com o google.';
        this.carregando = false;
      }
    });
  }

  entrarComGoogle(): void {
    const container = this.googleBtnContainer?.nativeElement;
    if (!container) return;
    const btn = container.querySelector('div[role=button]') as HTMLElement | null;
    if (btn) {
      btn.click();
    }
  }

  alternarModo(modo: 'entrar' | 'cadastrar'): void {
    this.modoAtual = modo;
    this.erro = '';
    this.formulario.reset();
  }

  alternarSenhaVisivel(): void {
    this.senhaVisivel = !this.senhaVisivel;
  }

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      const senhaCtrl = this.formulario.get('senha');
      const emailCtrl = this.formulario.get('email');
      if (senhaCtrl?.errors?.['required'] && emailCtrl?.errors?.['required']) {
        this.erro = 'preencha todos os campos.';
      } else if (senhaCtrl?.errors?.['minlength']) {
        this.erro = 'a senha deve ter no minimo 6 caracteres.';
      } else if (emailCtrl?.errors?.['email'] || emailCtrl?.errors?.['required']) {
        this.erro = 'informe um e-mail valido.';
      } else {
        this.erro = 'preencha todos os campos corretamente.';
      }
      return;
    }

    this.carregando = true;
    this.erro = '';
    const { nome, email, senha } = this.formulario.value;

    if (this.modoAtual === 'entrar') {
      this.authService.login(email, senha).subscribe({
        next: () => this.router.navigate(['/home']),
        error: () => {
          this.erro = 'e-mail ou senha incorretos.';
          this.carregando = false;
        }
      });
    } else {
      this.authService.register(nome, email, senha).subscribe({
        next: () => this.router.navigate(['/home']),
        error: () => {
          this.erro = 'erro ao criar conta. tente novamente.';
          this.carregando = false;
        }
      });
    }
  }
}
