
package com.project.todo_api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.todo_api.model.Status;
import com.project.todo_api.model.Tarefa;

@Repository
public interface TarefaRepository extends JpaRepository<Tarefa, Long> {
    List<Tarefa> findByUsuarioIdOrderByDataCriacaoDesc(Long usuarioId);
    Optional<Tarefa> findByIdAndUsuarioId(Long id, Long usuarioId);
    List<Tarefa> findByUsuarioIdAndStatusOrderByDataCriacaoDesc(Long usuarioId, Status status);
    List<Tarefa> findByUsuarioIdOrderByDataPrazoAsc(Long usuarioId);
    void deleteAllByUsuarioId(Long usuarioId);
}
