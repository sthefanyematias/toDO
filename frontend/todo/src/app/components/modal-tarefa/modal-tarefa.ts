
import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TarefaService } from '../../core/services/tarefa.service';
import { Tarefa, TarefaRequest } from '../../core/models/tarefa.model';

@Component({
  selector: 'app-modal-tarefa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-tarefa.html',
  styleUrl: './modal-tarefa.css'
})
export class ModalTarefa implements OnInit {
  @Input() tarefaEmEdicao: Tarefa | null = null;
  @Output() aoFechar = new EventEmitter<void>();
  @Output() aoSalvar = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private tarefaService = inject(TarefaService);

  salvando = false;

  formulario: FormGroup = this.fb.group({
    titulo: ['', Validators.required],
    descricao: [''],
    categoria: ['PESSOAL', Validators.required],
    prioridade: ['MEDIA'],
    dataPrazo: ['']
  });

  ngOnInit(): void {
    if (this.tarefaEmEdicao) {
      this.formulario.patchValue({
        titulo: this.tarefaEmEdicao.titulo,
        descricao: this.tarefaEmEdicao.descricao ?? '',
        categoria: this.tarefaEmEdicao.categoria ?? 'PESSOAL',
        prioridade: this.tarefaEmEdicao.prioridade ?? 'MEDIA',
        dataPrazo: this.tarefaEmEdicao.dataPrazo ? this.tarefaEmEdicao.dataPrazo.split('T')[0] : ''
      });
    }
  }

  fechar(): void {
    this.aoFechar.emit();
  }

  salvar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.salvando = true;
    const val = this.formulario.value;

    const dados: TarefaRequest = {
      titulo: val.titulo.trim(),
      descricao: val.descricao ? val.descricao.trim() : undefined,
      categoria: val.categoria,
      prioridade: val.prioridade || 'MEDIA',
      dataPrazo: val.dataPrazo ? `${val.dataPrazo}T00:00:00` : undefined
    };

    if (this.tarefaEmEdicao) {
      this.tarefaService.atualizar(this.tarefaEmEdicao.id, dados).subscribe({
        next: () => { this.salvando = false; this.aoSalvar.emit(); },
        error: () => { this.salvando = false; }
      });
    } else {
      this.tarefaService.criar(dados).subscribe({
        next: () => { this.salvando = false; this.aoSalvar.emit(); },
        error: () => { this.salvando = false; }
      });
    }
  }
}
