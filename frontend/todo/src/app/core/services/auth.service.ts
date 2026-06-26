
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../models/usuario.model';

interface AuthResponse {
  token: string;
  tipo: string;
  usuario: Usuario;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

  private usuarioSubject = new BehaviorSubject<Usuario | null>(this.getUsuarioStorage());
  usuario$ = this.usuarioSubject.asObservable();

  login(email: string, senha: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, senha }).pipe(
      tap(res => this.salvarSessao(res))
    );
  }

  register(nome: string, email: string, senha: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, { nome, email, senha }).pipe(
      tap(res => this.salvarSessao(res))
    );
  }

  loginComGoogle(idToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/google`, { idToken }).pipe(
      tap(res => this.salvarSessao(res))
    );
  }

  private salvarSessao(res: AuthResponse): void {
    const usuario = this.normalizarFotoUrl(res.usuario);
    localStorage.setItem('token', res.token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    this.usuarioSubject.next(usuario);
  }

  atualizarUsuarioLocal(usuario: Usuario): void {
    const normalizado = this.normalizarFotoUrl(usuario);
    localStorage.setItem('usuario', JSON.stringify(normalizado));
    this.usuarioSubject.next(normalizado);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.usuarioSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsuario(): Usuario | null {
    return this.usuarioSubject.value;
  }

  estaAutenticado(): boolean {
    return !!this.getToken();
  }

  private getUsuarioStorage(): Usuario | null {
    const dados = localStorage.getItem('usuario');
    return dados ? JSON.parse(dados) : null;
  }

  private normalizarFotoUrl(usuario: Usuario): Usuario {
    if (!usuario.urlFoto) return usuario;
    if (usuario.urlFoto.startsWith('http')) {
      return usuario;
    }
    if (usuario.urlFoto.startsWith('/')) {
      return { ...usuario, urlFoto: `${this.apiUrl}${usuario.urlFoto}` };
    }
    return usuario;
  }
}
