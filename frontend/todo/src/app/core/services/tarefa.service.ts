
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Tarefa, TarefaRequest, Status } from '../models/tarefa.model';

@Injectable({ providedIn: 'root' })
export class TarefaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tarefas`;

  listar(status?: Status): Observable<Tarefa[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Tarefa[]>(this.apiUrl, { params });
  }

  buscarPorId(id: number): Observable<Tarefa> {
    return this.http.get<Tarefa>(`${this.apiUrl}/${id}`);
  }

  criar(tarefa: TarefaRequest): Observable<Tarefa> {
    return this.http.post<Tarefa>(this.apiUrl, tarefa);
  }

  atualizar(id: number, tarefa: TarefaRequest): Observable<Tarefa> {
    return this.http.put<Tarefa>(`${this.apiUrl}/${id}`, tarefa);
  }

  atualizarStatus(id: number, status: Status): Observable<Tarefa> {
    return this.http.patch<Tarefa>(`${this.apiUrl}/${id}/status`, null, {
      params: { status }
    });
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
