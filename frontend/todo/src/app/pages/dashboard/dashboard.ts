
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TarefaService } from '../../core/services/tarefa.service';
import { Tarefa } from '../../core/models/tarefa.model';
import { ModalTarefa } from '../../components/modal-tarefa/modal-tarefa';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ModalTarefa],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private tarefaService = inject(TarefaService);
  private router = inject(Router);

  tarefas: Tarefa[] = [];
  carregando = true;
  calendarioAberto = false;
  mesSelecionado = new Date();
  modalAberto = false;

  ngOnInit(): void {
    this.carregarTarefas();
  }

  carregarTarefas(): void {
    this.carregando = true;
    this.tarefaService.listar().subscribe({
      next: t => { this.tarefas = t; this.carregando = false; },
      error: () => { this.carregando = false; }
    });
  }

  get total(): number { return this.tarefas.length; }
  get pendentes(): number { return this.tarefas.filter(t => t.status === 'PENDENTE').length; }
  get emAndamento(): number { return this.tarefas.filter(t => t.status === 'EM_ANDAMENTO').length; }
  get concluidas(): number { return this.tarefas.filter(t => t.status === 'CONCLUIDA').length; }

  get tarefasHoje(): Tarefa[] {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return this.tarefas.filter(t => {
      if (!t.dataPrazo || t.status === 'CONCLUIDA') return false;
      const p = new Date(t.dataPrazo);
      p.setHours(0, 0, 0, 0);
      return p.getTime() === hoje.getTime();
    });
  }

  get tarefasProximas(): Tarefa[] {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const limite = new Date(hoje);
    limite.setDate(limite.getDate() + 7);
    return this.tarefas.filter(t => {
      if (!t.dataPrazo || t.status === 'CONCLUIDA') return false;
      const p = new Date(t.dataPrazo);
      p.setHours(0, 0, 0, 0);
      return p > hoje && p <= limite;
    });
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  abrirModal(): void {
    this.modalAberto = true;
  }

  fecharModal(): void {
    this.modalAberto = false;
  }

  aoSalvarTarefa(): void {
    this.modalAberto = false;
    this.carregarTarefas();
  }

  irParaKanban(): void {
    this.router.navigate(['/kanban']);
  }

  irParaKanbanStatus(status: string): void {
    this.router.navigate(['/kanban'], { queryParams: { status } });
  }

  irParaTarefa(id: number): void {
    this.router.navigate(['/kanban'], { queryParams: { tarefa: id } });
  }

  irParaKanbanDia(dia: Date): void {
    const tarefasDia = this.tarefasNoDia(dia);
    if (tarefasDia.length === 1) {
      this.router.navigate(['/kanban'], { queryParams: { tarefa: tarefasDia[0].id } });
    } else {
      const data = dia.toISOString().split('T')[0];
      this.router.navigate(['/kanban'], { queryParams: { data } });
    }
    this.calendarioAberto = false;
  }

  alternarCalendario(): void {
    this.calendarioAberto = !this.calendarioAberto;
  }

  get diasDoMes(): (Date | null)[] {
    const ano = this.mesSelecionado.getFullYear();
    const mes = this.mesSelecionado.getMonth();
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const totalDias = new Date(ano, mes + 1, 0).getDate();
    const dias: (Date | null)[] = [];
    for (let i = 0; i < primeiroDia; i++) dias.push(null);
    for (let d = 1; d <= totalDias; d++) dias.push(new Date(ano, mes, d));
    return dias;
  }

  tarefasNoDia(dia: Date): Tarefa[] {
    return this.tarefas.filter(t => {
      if (!t.dataPrazo) return false;
      const p = new Date(t.dataPrazo);
      return p.getDate() === dia.getDate() &&
        p.getMonth() === dia.getMonth() &&
        p.getFullYear() === dia.getFullYear();
    });
  }

  tooltipDia(dia: Date): string {
    return this.tarefasNoDia(dia).map(t => t.titulo).join(', ');
  }

  ehHoje(dia: Date): boolean {
    const hoje = new Date();
    return dia.getDate() === hoje.getDate() &&
      dia.getMonth() === hoje.getMonth() &&
      dia.getFullYear() === hoje.getFullYear();
  }

  corStatus(status: string): string {
    if (status === 'PENDENTE') return '#e8a0bc';
    if (status === 'EM_ANDAMENTO') return '#e8b898';
    return '#90c8b0';
  }

  mesAnterior(): void {
    this.mesSelecionado = new Date(
      this.mesSelecionado.getFullYear(),
      this.mesSelecionado.getMonth() - 1, 1
    );
  }

  proximoMes(): void {
    this.mesSelecionado = new Date(
      this.mesSelecionado.getFullYear(),
      this.mesSelecionado.getMonth() + 1, 1
    );
  }

  get nomeMes(): string {
    return this.mesSelecionado.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }
}
