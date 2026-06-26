
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TarefaService } from '../../core/services/tarefa.service';
import { Tarefa, Status } from '../../core/models/tarefa.model';
import { TaskCard } from '../../components/task-card/task-card';
import { ModalTarefa } from '../../components/modal-tarefa/modal-tarefa';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, DragDropModule, TaskCard, ModalTarefa],
  templateUrl: './kanban.html',
  styleUrl: './kanban.css'
})
export class Kanban implements OnInit {
  private tarefaService = inject(TarefaService);
  private route = inject(ActivatedRoute);

  pendentes: Tarefa[] = [];
  emAndamento: Tarefa[] = [];
  concluidas: Tarefa[] = [];
  carregando = true;
  modalAberto = false;
  tarefaEmEdicao: Tarefa | null = null;
  termoBusca = '';
  tarefaDestacada: number | null = null;
  filtroStatus: string | null = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.termoBusca = params['busca'] || '';
      this.tarefaDestacada = params['tarefa'] ? +params['tarefa'] : null;
      this.filtroStatus = params['status'] || null;
      this.carregarTarefas();
    });
  }

  private ordemPrioridade(t: Tarefa): number {
    if (t.prioridade === 'ALTA') return 0;
    if (t.prioridade === 'MEDIA') return 1;
    return 2;
  }

  private filtrar(lista: Tarefa[]): Tarefa[] {
    if (!this.termoBusca.trim()) return lista;
    const t = this.termoBusca.toLowerCase();
    return lista.filter(ta =>
      ta.titulo.toLowerCase().includes(t) ||
      (ta.descricao && ta.descricao.toLowerCase().includes(t)) ||
      (ta.categoria && ta.categoria.toLowerCase().includes(t))
    );
  }

  carregarTarefas(): void {
    this.carregando = true;
    this.tarefaService.listar().subscribe({
      next: tarefas => {
        const ordenar = (lista: Tarefa[]) =>
          lista.sort((a, b) => this.ordemPrioridade(a) - this.ordemPrioridade(b));

        this.pendentes = ordenar(this.filtrar(tarefas.filter(t => t.status === 'PENDENTE')));
        this.emAndamento = ordenar(this.filtrar(tarefas.filter(t => t.status === 'EM_ANDAMENTO')));
        this.concluidas = ordenar(this.filtrar(tarefas.filter(t => t.status === 'CONCLUIDA')));
        this.carregando = false;

        if (this.tarefaDestacada) {
          setTimeout(() => this.rolarParaTarefa(this.tarefaDestacada!), 300);
        }
      },
      error: () => { this.carregando = false; }
    });
  }

  rolarParaTarefa(id: number): void {
    const el = document.getElementById(`tarefa-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => { this.tarefaDestacada = null; }, 3000);
  }

  soltar(event: CdkDragDrop<Tarefa[]>, novoStatus: Status): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      const tarefa = event.container.data[event.currentIndex];
      tarefa.status = novoStatus;
      this.tarefaService.atualizarStatus(tarefa.id, novoStatus).subscribe({
        error: () => {
          transferArrayItem(
            event.container.data,
            event.previousContainer.data,
            event.currentIndex,
            event.previousIndex
          );
          tarefa.status = event.previousContainer.data[event.previousIndex]?.status ?? tarefa.status;
        }
      });
    }
  }

  abrirModalNovo(): void {
    this.tarefaEmEdicao = null;
    this.modalAberto = true;
  }

  abrirModalEdicao(tarefa: Tarefa): void {
    this.tarefaEmEdicao = tarefa;
    this.modalAberto = true;
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.tarefaEmEdicao = null;
  }

  aoSalvar(): void {
    this.fecharModal();
    this.carregarTarefas();
  }

  excluirTarefa(tarefa: Tarefa): void {
    this.tarefaService.deletar(tarefa.id).subscribe(() => this.carregarTarefas());
  }

  get temFiltro(): boolean {
    return !!this.termoBusca.trim();
  }

  limparFiltro(): void {
    this.termoBusca = '';
    this.tarefaDestacada = null;
    this.carregarTarefas();
  }
}
