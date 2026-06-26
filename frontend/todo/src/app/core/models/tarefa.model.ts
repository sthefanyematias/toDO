
export type Status = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA';
export type Categoria = 'TRABALHO' | 'PESSOAL' | 'ESTUDOS';
export type Prioridade = 'BAIXA' | 'MEDIA' | 'ALTA';

export interface Tarefa {
  id: number;
  titulo: string;
  descricao?: string;
  status: Status;
  categoria?: Categoria;
  prioridade?: Prioridade;
  dataCriacao: string;
  dataConclusao?: string;
  dataPrazo?: string;
  usuarioId: number;
}

export interface TarefaRequest {
  titulo: string;
  descricao?: string;
  categoria: Categoria;
  prioridade?: Prioridade;
  dataPrazo?: string;
}
