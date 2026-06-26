
package com.project.todo_api.controller;

import com.project.todo_api.dto.request.UsuarioUpdateRequest;
import com.project.todo_api.dto.response.TarefaResponse;
import com.project.todo_api.dto.response.UsuarioResponse;
import com.project.todo_api.model.Status;
import com.project.todo_api.model.Usuario;
import com.project.todo_api.service.TarefaService;
import com.project.todo_api.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final TarefaService tarefaService;

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> meuPerfil(Authentication authentication) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return ResponseEntity.ok(usuarioService.buscarPorId(usuario.getId()));
    }

    @PutMapping("/me")
    public ResponseEntity<UsuarioResponse> atualizar(
            Authentication authentication,
            @Valid @RequestBody UsuarioUpdateRequest request) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return ResponseEntity.ok(usuarioService.atualizar(usuario.getId(), request));
    }

    @PostMapping(value = "/me/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UsuarioResponse> atualizarFoto(
            Authentication authentication,
            @RequestParam("foto") MultipartFile foto) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return ResponseEntity.ok(usuarioService.atualizarFoto(usuario.getId(), foto));
    }

    @DeleteMapping("/me/foto")
    public ResponseEntity<UsuarioResponse> removerFoto(Authentication authentication) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return ResponseEntity.ok(usuarioService.removerFoto(usuario.getId()));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deletar(Authentication authentication) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        usuarioService.deletar(usuario.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/tarefas")
    public ResponseEntity<List<TarefaResponse>> minhasTarefas(
            Authentication authentication,
            @RequestParam(required = false) Status status) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        if (status != null) {
            return ResponseEntity.ok(tarefaService.listarPorUsuarioEStatus(usuario.getId(), status));
        }
        return ResponseEntity.ok(tarefaService.listarPorUsuario(usuario.getId()));
    }
}
