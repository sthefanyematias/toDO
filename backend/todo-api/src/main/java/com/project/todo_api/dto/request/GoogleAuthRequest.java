
package com.project.todo_api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleAuthRequest {

    @NotBlank(message = "ID Token do Google é obrigatório")
    private String idToken;
}
