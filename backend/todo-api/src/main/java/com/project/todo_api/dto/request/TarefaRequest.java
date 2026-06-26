
package com.project.todo_api.dto.request;

import com.project.todo_api.model.Categoria;
import com.project.todo_api.model.Prioridade;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TarefaRequest {

    @NotBlank(message = "Título é obrigatório")
    private String titulo;

    private String descricao;

    @NotNull(message = "Categoria é obrigatória")
    private Categoria categoria;

    private Prioridade prioridade;
    private LocalDateTime dataPrazo;
}
