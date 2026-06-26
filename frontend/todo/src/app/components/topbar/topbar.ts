import { Component, inject, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TarefaService } from '../../core/services/tarefa.service';
import { Tarefa } from '../../core/models/tarefa.model';
import { Usuario } from '../../core/models/usuario.model';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class Topbar implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private tarefaService = inject(TarefaService);
  private router = inject(Router);
  private elRef = inject(ElementRef);

  usuario: Usuario | null = null;
  buscaAberta = false;
  termoBusca = '';
  menuPerfilAberto = false;
  notificacoesAbertas = false;
  tarefasProximas: Tarefa[] = [];
  todasTarefas: Tarefa[] = [];
  resultadosBusca: Tarefa[] = [];
  atualizando = false;
  ultimaAtualizacao = '';

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly INTERVALO_MS = 15_000;

  ngOnInit(): void {
    this.authService.usuario$.subscribe(u => (this.usuario = u));
    this.carregarTarefas();
    this.intervalId = setInterval(() => this.carregarTarefas(), this.INTERVALO_MS);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  @HostListener('window:focus')
  aoVoltarFoco(): void {
    this.carregarTarefas();
  }

  carregarTarefas(): void {
    this.atualizando = true;
    this.tarefaService.listar().subscribe({
      next: tarefas => {
        this.todasTarefas = tarefas;
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const limite = new Date(hoje);
        limite.setDate(limite.getDate() + 3);
        this.tarefasProximas = tarefas.filter(t => {
          if (!t.dataPrazo || t.status === 'CONCLUIDA') return false;
          const prazo = new Date(t.dataPrazo);
          prazo.setHours(0, 0, 0, 0);
          return prazo <= limite;
        });
        this.atualizando = false;
        this.ultimaAtualizacao = this.formatarHora(new Date());
      },
      error: () => { this.atualizando = false; }
    });
  }

  abrirBusca(): void {
    this.buscaAberta = true;
  }

  aoBuscar(termo: string): void {
    this.termoBusca = termo;
    if (termo.trim().length >= 2) {
      const t = termo.toLowerCase();
      this.resultadosBusca = this.todasTarefas.filter(ta =>
        ta.titulo.toLowerCase().includes(t) ||
        (ta.descricao && ta.descricao.toLowerCase().includes(t)) ||
        (ta.categoria && ta.categoria.toLowerCase().includes(t))
      ).slice(0, 5);
    } else {
      this.resultadosBusca = [];
    }
  }

  executarBusca(): void {
    if (this.termoBusca.trim()) {
      this.router.navigate(['/kanban'], { queryParams: { busca: this.termoBusca.trim() } });
      this.resultadosBusca = [];
      this.buscaAberta = false;
      this.termoBusca = '';
    }
  }

  fecharBuscaSeLimpa(): void {
    setTimeout(() => {
      if (!this.termoBusca) {
        this.buscaAberta = false;
        this.resultadosBusca = [];
      }
    }, 200);
  }

  limparBusca(): void {
    this.termoBusca = '';
    this.resultadosBusca = [];
    this.buscaAberta = false;
  }

  irParaHome(): void {
    this.router.navigate(['/home']);
  }

  irParaTarefa(id: number): void {
    this.router.navigate(['/kanban'], { queryParams: { tarefa: id } });
    this.notificacoesAbertas = false;
    this.resultadosBusca = [];
    this.buscaAberta = false;
    this.termoBusca = '';
  }

  alternarMenuPerfil(): void {
    this.menuPerfilAberto = !this.menuPerfilAberto;
    if (this.menuPerfilAberto) this.notificacoesAbertas = false;
  }

  alternarNotificacoes(): void {
    this.notificacoesAbertas = !this.notificacoesAbertas;
    if (this.notificacoesAbertas) {
      this.menuPerfilAberto = false;
      this.carregarTarefas();
    }
  }

  irParaPerfil(): void {
    this.router.navigate(['/perfil']);
    this.menuPerfilAberto = false;
  }

  logout(): void {
    this.authService.logout();
  }

  formatarPrazo(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  formatarHora(data: Date): string {
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  labelStatus(status: string): string {
    const mapa: Record<string, string> = {
      PENDENTE: 'pendente',
      EM_ANDAMENTO: 'em andamento',
      CONCLUIDA: 'concluida'
    };
    return mapa[status] ?? status;
  }

  get iniciaisUsuario(): string {
    if (!this.usuario?.nome) return '?';
    return this.usuario.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  @HostListener('document:click', ['$event'])
  fecharMenus(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.menuPerfilAberto = false;
      this.notificacoesAbertas = false;
      if (!this.termoBusca) {
        this.buscaAberta = false;
        this.resultadosBusca = [];
      }
    }
  }
}
