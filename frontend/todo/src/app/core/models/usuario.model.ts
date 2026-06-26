
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  urlFoto?: string;
  role: string;
  temSenha?: boolean;
  criadoEm: string;
}
