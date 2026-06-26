
package com.project.todo_api.service;

import com.project.todo_api.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GoogleTokenService {

    private final RestTemplate restTemplate;

    public Map<String, String> validarToken(String idToken) {
        String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
        try {
            Map<?, ?> response = restTemplate.getForObject(url, Map.class);

            if (response == null || response.get("email") == null) {
                throw new BusinessException("Token do Google inválido ou expirado");
            }

            String emailVerified = (String) response.get("email_verified");
            if (!"true".equals(emailVerified)) {
                throw new BusinessException("E-mail do Google não verificado");
            }

            Map<String, String> result = new HashMap<>();
            result.put("email", (String) response.get("email"));
            result.put("nome", (String) response.get("name"));
            result.put("googleId", (String) response.get("sub"));
            result.put("urlFoto", (String) response.get("picture"));
            return result;

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException("Erro ao validar token do Google: " + e.getMessage());
        }
    }
}
