
package com.project.todo_api.service;

import com.project.todo_api.dto.request.GoogleAuthRequest;
import com.project.todo_api.dto.request.LoginRequest;
import com.project.todo_api.dto.request.RegisterRequest;
import com.project.todo_api.dto.response.AuthResponse;
import com.project.todo_api.dto.response.UsuarioResponse;
import com.project.todo_api.exception.BusinessException;
import com.project.todo_api.model.Role;
import com.project.todo_api.model.Usuario;
import com.project.todo_api.repository.UsuarioRepository;
import com.project.todo_api.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final GoogleTokenService googleTokenService;

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BusinessException("E-mail ou senha inválidos"));

        if (usuario.getSenha() == null || !passwordEncoder.matches(request.getSenha(), usuario.getSenha())) {
            throw new BusinessException("E-mail ou senha inválidos");
        }

        String token = jwtUtil.gerarToken(usuario);
        return new AuthResponse(token, UsuarioResponse.from(usuario));
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (usuarioRepository.existsByEmail(email)) {
            throw new BusinessException("Este e-mail já está cadastrado!");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(request.getNome().trim());
        usuario.setEmail(email);
        usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        usuario.setRole(Role.USER);

        usuario = usuarioRepository.save(usuario);
        String token = jwtUtil.gerarToken(usuario);
        return new AuthResponse(token, UsuarioResponse.from(usuario));
    }

    @Transactional
    public AuthResponse googleAuth(GoogleAuthRequest request) {
        Map<String, String> googleData = googleTokenService.validarToken(request.getIdToken());

        String email = googleData.get("email");
        String nome = googleData.get("nome");
        String googleId = googleData.get("googleId");
        String urlFoto = googleData.get("urlFoto");

        Usuario usuario = usuarioRepository.findByEmail(email).orElseGet(() -> {
            Usuario novo = new Usuario();
            novo.setNome(nome);
            novo.setEmail(email);
            novo.setGoogleId(googleId);
            novo.setUrlFoto(urlFoto);
            novo.setRole(Role.USER);
            return usuarioRepository.save(novo);
        });

        if (usuario.getGoogleId() == null) {
            usuario.setGoogleId(googleId);
            if (usuario.getUrlFoto() == null) {
                usuario.setUrlFoto(urlFoto);
            }
            usuarioRepository.save(usuario);
        }

        String token = jwtUtil.gerarToken(usuario);
        return new AuthResponse(token, UsuarioResponse.from(usuario));
    }
}
