
package com.project.todo_api.service;

import com.project.todo_api.dto.request.UsuarioUpdateRequest;
import com.project.todo_api.dto.response.UsuarioResponse;
import com.project.todo_api.exception.BusinessException;
import com.project.todo_api.model.Usuario;
import com.project.todo_api.repository.TarefaRepository;
import com.project.todo_api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final TarefaRepository tarefaRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${upload.dir:uploads/}")
    private String uploadDir;

    @Transactional(readOnly = true)
    public UsuarioResponse buscarPorId(Long id) {
        return UsuarioResponse.from(encontrarPorId(id));
    }

    public Usuario encontrarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado"));
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findAll()
                .stream()
                .map(UsuarioResponse::from)
                .toList();
    }

    @Transactional
    public UsuarioResponse atualizar(Long id, UsuarioUpdateRequest request) {
        Usuario usuario = encontrarPorId(id);
        String novoEmail = request.getEmail().trim().toLowerCase();

        if (!usuario.getEmail().equals(novoEmail)) {
            if (usuarioRepository.existsByEmail(novoEmail)) {
                throw new BusinessException("Este e-mail já está em uso por outra conta");
            }
        }

        usuario.setNome(request.getNome().trim());
        usuario.setEmail(novoEmail);

        if (request.getNovaSenha() != null && !request.getNovaSenha().isBlank()) {
            if (usuario.getSenha() != null) {
                if (request.getSenhaAtual() == null || !passwordEncoder.matches(request.getSenhaAtual(), usuario.getSenha())) {
                    throw new BusinessException("Senha atual incorreta");
                }
            }
            usuario.setSenha(passwordEncoder.encode(request.getNovaSenha()));
        }

        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponse atualizarFoto(Long id, MultipartFile foto) {
        if (foto.isEmpty()) {
            throw new BusinessException("Arquivo de foto não pode ser vazio");
        }

        String contentType = foto.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessException("Apenas imagens são permitidas");
        }

        Usuario usuario = encontrarPorId(id);

        try {
            Path uploadPath = Path.of(uploadDir).toAbsolutePath();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String extensao = StringUtils.getFilenameExtension(foto.getOriginalFilename());
            String nomeArquivo = "user-" + id + "-" + System.currentTimeMillis() + "." + extensao;
            Path caminhoArquivo = uploadPath.resolve(nomeArquivo);
            Files.copy(foto.getInputStream(), caminhoArquivo, StandardCopyOption.REPLACE_EXISTING);

            usuario.setUrlFoto("/uploads/" + nomeArquivo);
            return UsuarioResponse.from(usuarioRepository.save(usuario));

        } catch (IOException e) {
            throw new BusinessException("Erro ao salvar foto: " + e.getMessage());
        }
    }

    @Transactional
    public UsuarioResponse removerFoto(Long id) {
        Usuario usuario = encontrarPorId(id);
        usuario.setUrlFoto(null);
        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    @Transactional
    public void deletar(Long id) {
        tarefaRepository.deleteAllByUsuarioId(id);
        Usuario usuario = encontrarPorId(id);
        usuarioRepository.delete(usuario);
    }
}
