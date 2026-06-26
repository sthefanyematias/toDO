
package com.project.todo_api.dto.response;

import lombok.Data;

@Data
public class AuthResponse {

    private String token;
    private String tipo;
    private UsuarioResponse usuario;

    public AuthResponse(String token, UsuarioResponse usuario) {
        this.token = token;
        this.tipo = "Bearer";
        this.usuario = usuario;
    }
}
