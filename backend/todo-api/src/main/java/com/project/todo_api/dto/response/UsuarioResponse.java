package com.project.todo_api.dto.response;

import com.project.todo_api.model.Usuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponse {

    private Long id;
    private String nome;
    private String email;
    private String urlFoto;
    private String role;
    private Boolean temSenha;
    private LocalDateTime criadoEm;

    public static UsuarioResponse from(Usuario usuario) {
        return UsuarioResponse.builder()
                .id(usuario.getId())
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .urlFoto(usuario.getUrlFoto())
                .role(usuario.getRole().name())
                .temSenha(usuario.getSenha() != null)
                .criadoEm(usuario.getCriadoEm())
                .build();
    }
}
