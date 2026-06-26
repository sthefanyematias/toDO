
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../models/usuario.model';
import { AuthService } from './auth.service';

interface UsuarioUpdateRequest {
  nome: string;
  email: string;
  senhaAtual?: string;
  novaSenha?: string;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/usuarios`;

  getMeuPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/me`).pipe(
      map(u => this.normalizarFotoUrl(u))
    );
  }

  atualizar(dados: UsuarioUpdateRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/me`, dados).pipe(
      map(u => this.normalizarFotoUrl(u)),
      tap(usuario => this.authService.atualizarUsuarioLocal(usuario))
    );
  }

  uploadFoto(foto: File): Observable<Usuario> {
    const formData = new FormData();
    formData.append('foto', foto);
    return this.http.post<Usuario>(`${this.apiUrl}/me/foto`, formData).pipe(
      map(u => this.normalizarFotoUrl(u)),
      tap(usuario => this.authService.atualizarUsuarioLocal(usuario))
    );
  }

  removerFoto(): Observable<Usuario> {
    return this.http.delete<Usuario>(`${this.apiUrl}/me/foto`).pipe(
      map(u => this.normalizarFotoUrl(u)),
      tap(usuario => this.authService.atualizarUsuarioLocal(usuario))
    );
  }

  deletarConta(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/me`);
  }

  private normalizarFotoUrl(usuario: Usuario): Usuario {
    if (!usuario.urlFoto) return usuario;
    if (usuario.urlFoto.startsWith('http')) {
      return usuario;
    }
    if (usuario.urlFoto.startsWith('/')) {
      return { ...usuario, urlFoto: `${environment.apiUrl}${usuario.urlFoto}` };
    }
    return usuario;
  }
}
