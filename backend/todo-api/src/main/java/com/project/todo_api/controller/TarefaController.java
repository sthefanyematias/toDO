
package com.project.todo_api.controller;

import com.project.todo_api.dto.request.TarefaRequest;
import com.project.todo_api.dto.response.TarefaResponse;
import com.project.todo_api.model.Status;
import com.project.todo_api.model.Usuario;
import com.project.todo_api.service.TarefaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tarefas")
@RequiredArgsConstructor
public class TarefaController {

    private final TarefaService tarefaService;

    @PostMapping
    public ResponseEntity<TarefaResponse> criar(
            Authentication authentication,
            @Valid @RequestBody TarefaRequest request) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(tarefaService.criar(request, usuario.getId()));
    }

    @GetMapping
    public ResponseEntity<List<TarefaResponse>> listar(
            Authentication authentication,
            @RequestParam(required = false) Status status) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        if (status != null) {
            return ResponseEntity.ok(tarefaService.listarPorUsuarioEStatus(usuario.getId(), status));
        }
        return ResponseEntity.ok(tarefaService.listarPorUsuario(usuario.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TarefaResponse> buscar(
            Authentication authentication,
            @PathVariable Long id) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return ResponseEntity.ok(tarefaService.buscarPorId(id, usuario.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TarefaResponse> atualizar(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody TarefaRequest request) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return ResponseEntity.ok(tarefaService.atualizar(id, request, usuario.getId()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TarefaResponse> atualizarStatus(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam Status status) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return ResponseEntity.ok(tarefaService.atualizarStatus(id, status, usuario.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            Authentication authentication,
            @PathVariable Long id) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        tarefaService.deletar(id, usuario.getId());
        return ResponseEntity.noContent().build();
    }
}
