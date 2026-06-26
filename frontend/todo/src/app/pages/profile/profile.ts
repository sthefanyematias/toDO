import { Component, inject, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Usuario } from '../../core/models/usuario.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  @ViewChild('inputFoto') inputFoto!: ElementRef<HTMLInputElement>;
  @ViewChild('editorImgEl') editorImgEl!: ElementRef<HTMLImageElement>;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);

  usuario: Usuario | null = null;
  salvando = false;
  salvandoFoto = false;
  mensagem = '';
  tipoMensagem: 'sucesso' | 'erro' = 'sucesso';
  mostrarSenha = false;
  senhaAtualVisivel = false;
  novaSenhaVisivel = false;
  confirmarDelecao = false;
  confirmarRemocaoFoto = false;

  editorFotoAberto = false;
  imagemEditorSrc = '';
  editorOffsetX = 0;
  editorOffsetY = 0;
  editorZoom = 1;
  zoomMin = 0.5;
  editorArrastando = false;
  editorArrastoStartX = 0;
  editorArrastoStartY = 0;
  editorOffsetStartX = 0;
  editorOffsetStartY = 0;
  editorImgNaturalWidth = 0;
  editorImgNaturalHeight = 0;
  private lastTouchDist = 0;
  private readonly VIEWPORT_SIZE = 260;

  formularioPerfil: FormGroup = this.fb.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  formularioSenha: FormGroup = this.fb.group({
    senhaAtual: [''],
    novaSenha: ['', [Validators.required, Validators.minLength(6)]]
  });

  get ehUsuarioGoogle(): boolean {
    return this.usuario?.temSenha === false;
  }

  ngOnInit(): void {
    this.authService.usuario$.subscribe(u => {
      this.usuario = u;
      if (u) {
        this.formularioPerfil.patchValue({ nome: u.nome, email: u.email });
        const senhaAtualCtrl = this.formularioSenha.get('senhaAtual');
        if (u.temSenha) {
          senhaAtualCtrl?.setValidators([Validators.required]);
        } else {
          senhaAtualCtrl?.clearValidators();
        }
        senhaAtualCtrl?.updateValueAndValidity();
      }
    });
    this.usuarioService.getMeuPerfil().subscribe({
      next: u => this.authService.atualizarUsuarioLocal(u)
    });
  }

  abrirSeletorFoto(): void {
    if (this.salvandoFoto) return;
    this.inputFoto.nativeElement.click();
  }

  aoSelecionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    input.value = '';
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagemEditorSrc = e.target?.result as string;
      this.editorOffsetX = 0;
      this.editorOffsetY = 0;
      this.editorZoom = 1;
      this.editorFotoAberto = true;
    };
    reader.readAsDataURL(file);
  }

  removerFoto(): void {
    if (this.salvandoFoto) return;
    this.salvandoFoto = true;
    this.confirmarRemocaoFoto = false;
    this.usuarioService.removerFoto().subscribe({
      next: (usuarioAtualizado) => {
        this.salvandoFoto = false;
        this.authService.atualizarUsuarioLocal(usuarioAtualizado);
        this.exibirMensagem('foto removida com sucesso', 'sucesso');
      },
      error: () => {
        this.salvandoFoto = false;
        this.exibirMensagem('erro ao remover a foto', 'erro');
      }
    });
  }

  onImageLoaded(): void {
    const img = this.editorImgEl.nativeElement;
    this.editorImgNaturalWidth = img.naturalWidth;
    this.editorImgNaturalHeight = img.naturalHeight;
    const minZoomX = this.VIEWPORT_SIZE / img.naturalWidth;
    const minZoomY = this.VIEWPORT_SIZE / img.naturalHeight;
    this.zoomMin = Math.max(minZoomX, minZoomY);
    this.editorZoom = this.zoomMin;
    this.limitarOffset();
  }

  onMouseDown(event: MouseEvent): void {
    this.editorArrastando = true;
    this.editorArrastoStartX = event.clientX;
    this.editorArrastoStartY = event.clientY;
    this.editorOffsetStartX = this.editorOffsetX;
    this.editorOffsetStartY = this.editorOffsetY;
    event.preventDefault();
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.editorArrastando) return;
    this.editorOffsetX = this.editorOffsetStartX + (event.clientX - this.editorArrastoStartX);
    this.editorOffsetY = this.editorOffsetStartY + (event.clientY - this.editorArrastoStartY);
    this.limitarOffset();
  }

  onMouseUp(): void { this.editorArrastando = false; }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.05 : 0.05;
    this.editorZoom = Math.max(this.zoomMin, Math.min(3, this.editorZoom + delta));
    this.limitarOffset();
  }

  onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      this.editorArrastando = true;
      this.editorArrastoStartX = event.touches[0].clientX;
      this.editorArrastoStartY = event.touches[0].clientY;
      this.editorOffsetStartX = this.editorOffsetX;
      this.editorOffsetStartY = this.editorOffsetY;
    } else if (event.touches.length === 2) {
      this.lastTouchDist = Math.hypot(
        event.touches[1].clientX - event.touches[0].clientX,
        event.touches[1].clientY - event.touches[0].clientY
      );
    }
    event.preventDefault();
  }

  onTouchMove(event: TouchEvent): void {
    event.preventDefault();
    if (event.touches.length === 1 && this.editorArrastando) {
      this.editorOffsetX = this.editorOffsetStartX + (event.touches[0].clientX - this.editorArrastoStartX);
      this.editorOffsetY = this.editorOffsetStartY + (event.touches[0].clientY - this.editorArrastoStartY);
      this.limitarOffset();
    } else if (event.touches.length === 2) {
      const dist = Math.hypot(
        event.touches[1].clientX - event.touches[0].clientX,
        event.touches[1].clientY - event.touches[0].clientY
      );
      const ratio = dist / this.lastTouchDist;
      this.editorZoom = Math.max(this.zoomMin, Math.min(3, this.editorZoom * ratio));
      this.lastTouchDist = dist;
      this.limitarOffset();
    }
  }

  onTouchEnd(): void { this.editorArrastando = false; }

  limitarOffset(): void {
    const scaledW = this.editorImgNaturalWidth * this.editorZoom;
    const scaledH = this.editorImgNaturalHeight * this.editorZoom;
    const maxX = Math.max(0, (scaledW - this.VIEWPORT_SIZE) / 2);
    const maxY = Math.max(0, (scaledH - this.VIEWPORT_SIZE) / 2);
    this.editorOffsetX = Math.max(-maxX, Math.min(maxX, this.editorOffsetX));
    this.editorOffsetY = Math.max(-maxY, Math.min(maxY, this.editorOffsetY));
  }

  get imageTransform(): string {
    return `translate(calc(-50% + ${this.editorOffsetX}px), calc(-50% + ${this.editorOffsetY}px)) scale(${this.editorZoom})`;
  }

  cancelarEditor(): void {
    if (this.salvandoFoto) return;
    this.editorFotoAberto = false;
    this.imagemEditorSrc = '';
  }

  confirmarFoto(): void {
    if (this.salvandoFoto) return;
    this.salvandoFoto = true;

    const outputSize = 400;
    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.clip();
    const img = new Image();
    img.onload = () => {
      const scale = outputSize / this.VIEWPORT_SIZE;
      const drawnW = this.editorImgNaturalWidth * this.editorZoom * scale;
      const drawnH = this.editorImgNaturalHeight * this.editorZoom * scale;
      const drawX = outputSize / 2 + this.editorOffsetX * scale - drawnW / 2;
      const drawY = outputSize / 2 + this.editorOffsetY * scale - drawnH / 2;
      ctx.drawImage(img, drawX, drawY, drawnW, drawnH);
      canvas.toBlob(blob => {
        if (!blob) {
          this.salvandoFoto = false;
          return;
        }
        const file = new File([blob], 'foto-perfil.jpg', { type: 'image/jpeg' });
        this.usuarioService.uploadFoto(file).subscribe({
          next: (usuarioAtualizado) => {
            this.salvandoFoto = false;
            this.editorFotoAberto = false;
            this.authService.atualizarUsuarioLocal(usuarioAtualizado);
            this.exibirMensagem('foto atualizada com sucesso', 'sucesso');
          },
          error: () => {
            this.salvandoFoto = false;
            this.exibirMensagem('erro ao atualizar a foto', 'erro');
          }
        });
      }, 'image/jpeg', 0.92);
    };
    img.src = this.imagemEditorSrc;
  }

  salvarPerfil(): void {
    if (this.salvando || this.formularioPerfil.invalid) return;
    this.salvando = true;
    this.usuarioService.atualizar(this.formularioPerfil.value).subscribe({
      next: () => { this.salvando = false; this.exibirMensagem('perfil atualizado com sucesso', 'sucesso'); },
      error: () => { this.salvando = false; this.exibirMensagem('erro ao atualizar perfil', 'erro'); }
    });
  }

  alterarSenha(): void {
    if (this.salvando || this.formularioSenha.invalid) return;
    this.salvando = true;
    const { senhaAtual, novaSenha } = this.formularioSenha.value;
    this.usuarioService.atualizar({
      nome: this.usuario!.nome,
      email: this.usuario!.email,
      senhaAtual: this.ehUsuarioGoogle ? undefined : senhaAtual,
      novaSenha
    }).subscribe({
      next: () => {
        this.salvando = false;
        this.formularioSenha.reset();
        this.mostrarSenha = false;
        this.exibirMensagem(
          this.ehUsuarioGoogle ? 'senha cadastrada com sucesso' : 'senha alterada com sucesso',
          'sucesso'
        );
      },
      error: () => {
        this.salvando = false;
        this.exibirMensagem(
          this.ehUsuarioGoogle ? 'erro ao cadastrar senha' : 'senha atual incorreta',
          'erro'
        );
      }
    });
  }

  deletarConta(): void {
    if (this.salvando) return;
    this.salvando = true;
    this.usuarioService.deletarConta().subscribe({
      next: () => {
        localStorage.clear();
        this.authService.logout();
      },
      error: (err) => {
        this.salvando = false;
        if (err.status === 0 || err.status >= 500) {
          this.exibirMensagem('erro de conexao. tente novamente.', 'erro');
        } else {
          this.exibirMensagem('erro ao deletar conta', 'erro');
        }
      }
    });
  }

  private exibirMensagem(texto: string, tipo: 'sucesso' | 'erro'): void {
    this.mensagem = texto;
    this.tipoMensagem = tipo;
    setTimeout(() => (this.mensagem = ''), 3500);
  }

  get iniciaisUsuario(): string {
    if (!this.usuario?.nome) return '?';
    return this.usuario.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }
}
