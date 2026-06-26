
package com.project.todo_api.service;

import com.project.todo_api.dto.request.TarefaRequest;
import com.project.todo_api.dto.response.TarefaResponse;
import com.project.todo_api.exception.BusinessException;
import com.project.todo_api.model.Prioridade;
import com.project.todo_api.model.Status;
import com.project.todo_api.model.Tarefa;
import com.project.todo_api.model.Usuario;
import com.project.todo_api.repository.TarefaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TarefaService {

    private final TarefaRepository tarefaRepository;
    private final UsuarioService usuarioService;

    @Transactional
    public TarefaResponse criar(TarefaRequest request, Long usuarioId) {
        Usuario usuario = usuarioService.encontrarPorId(usuarioId);

        Tarefa tarefa = new Tarefa();
        tarefa.setTitulo(request.getTitulo().trim());
        tarefa.setDescricao(request.getDescricao() != null ? request.getDescricao().trim() : null);
        tarefa.setCategoria(request.getCategoria());
        tarefa.setPrioridade(request.getPrioridade() != null ? request.getPrioridade() : Prioridade.MEDIA);
        tarefa.setStatus(Status.PENDENTE);
        tarefa.setDataPrazo(request.getDataPrazo());
        tarefa.setUsuario(usuario);

        return TarefaResponse.from(tarefaRepository.save(tarefa));
    }

    @Transactional(readOnly = true)
    public TarefaResponse buscarPorId(Long id, Long usuarioId) {
        Tarefa tarefa = tarefaRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new BusinessException("Tarefa não encontrada ou não pertence ao usuário"));
        return TarefaResponse.from(tarefa);
    }

    @Transactional(readOnly = true)
    public List<TarefaResponse> listarPorUsuario(Long usuarioId) {
        return tarefaRepository.findByUsuarioIdOrderByDataCriacaoDesc(usuarioId)
                .stream()
                .map(TarefaResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TarefaResponse> listarPorUsuarioEStatus(Long usuarioId, Status status) {
        return tarefaRepository.findByUsuarioIdAndStatusOrderByDataCriacaoDesc(usuarioId, status)
                .stream()
                .map(TarefaResponse::from)
                .toList();
    }

    @Transactional
    public TarefaResponse atualizar(Long id, TarefaRequest request, Long usuarioId) {
        Tarefa tarefa = tarefaRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new BusinessException("Tarefa não encontrada ou não pertence ao usuário"));

        tarefa.setTitulo(request.getTitulo().trim());
        tarefa.setDescricao(request.getDescricao() != null ? request.getDescricao().trim() : null);
        tarefa.setCategoria(request.getCategoria());
        tarefa.setDataPrazo(request.getDataPrazo());

        if (request.getPrioridade() != null) {
            tarefa.setPrioridade(request.getPrioridade());
        }

        return TarefaResponse.from(tarefaRepository.save(tarefa));
    }

    @Transactional
    public TarefaResponse atualizarStatus(Long id, Status novoStatus, Long usuarioId) {
        Tarefa tarefa = tarefaRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new BusinessException("Tarefa não encontrada ou não pertence ao usuário"));

        tarefa.setStatus(novoStatus);

        if (novoStatus == Status.CONCLUIDA) {
            tarefa.setDataConclusao(LocalDateTime.now());
        } else {
            tarefa.setDataConclusao(null);
        }

        return TarefaResponse.from(tarefaRepository.save(tarefa));
    }

    @Transactional
    public void deletar(Long id, Long usuarioId) {
        Tarefa tarefa = tarefaRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new BusinessException("Tarefa não encontrada ou não pertence ao usuário"));
        tarefaRepository.delete(tarefa);
    }
}
