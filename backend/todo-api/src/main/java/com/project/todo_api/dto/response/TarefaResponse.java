
package com.project.todo_api.dto.response;

import com.project.todo_api.model.Tarefa;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TarefaResponse {

    private Long id;
    private String titulo;
    private String descricao;
    private String status;
    private String categoria;
    private String prioridade;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataConclusao;
    private LocalDateTime dataPrazo;
    private Long usuarioId;

    public static TarefaResponse from(Tarefa tarefa) {
        return TarefaResponse.builder()
                .id(tarefa.getId())
                .titulo(tarefa.getTitulo())
                .descricao(tarefa.getDescricao())
                .status(tarefa.getStatus().name())
                .categoria(tarefa.getCategoria() != null ? tarefa.getCategoria().name() : null)
                .prioridade(tarefa.getPrioridade() != null ? tarefa.getPrioridade().name() : null)
                .dataCriacao(tarefa.getDataCriacao())
                .dataConclusao(tarefa.getDataConclusao())
                .dataPrazo(tarefa.getDataPrazo())
                .usuarioId(tarefa.getUsuario().getId())
                .build();
    }
}
