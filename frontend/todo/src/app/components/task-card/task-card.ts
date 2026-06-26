
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tarefa } from '../../core/models/tarefa.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-card.html',
  styleUrl: './task-card.css'
})
export class TaskCard {
  @Input() tarefa!: Tarefa;
  @Input() destacada = false;
  @Output() aoEditar = new EventEmitter<Tarefa>();
  @Output() aoExcluir = new EventEmitter<Tarefa>();

  confirmarExclusao = false;

  editar(): void { this.aoEditar.emit(this.tarefa); }
  pedirConfirmacao(): void { this.confirmarExclusao = true; }
  cancelar(): void { this.confirmarExclusao = false; }
  confirmarEExcluir(): void { this.aoExcluir.emit(this.tarefa); }

  get corPrioridade(): string {
    if (this.tarefa.prioridade === 'ALTA') return '#c07090';
    if (this.tarefa.prioridade === 'MEDIA') return '#c09060';
    return '#70a890';
  }

  get bgPrioridade(): string {
    if (this.tarefa.prioridade === 'ALTA') return '#fde8f0';
    if (this.tarefa.prioridade === 'MEDIA') return '#fff0e8';
    return '#e5f5f0';
  }

  get labelPrioridade(): string {
    const mapa: Record<string, string> = { ALTA: 'alta', MEDIA: 'media', BAIXA: 'baixa' };
    return mapa[this.tarefa.prioridade ?? ''] ?? '';
  }

  get labelCategoria(): string {
    if (!this.tarefa.categoria) return '';
    return this.tarefa.categoria.toLowerCase().replace('_', ' ');
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  get prazoVencido(): boolean {
    if (!this.tarefa.dataPrazo || this.tarefa.status === 'CONCLUIDA') return false;
    const prazo = new Date(this.tarefa.dataPrazo);
    prazo.setHours(23, 59, 59, 999);
    return prazo < new Date();
  }
}
