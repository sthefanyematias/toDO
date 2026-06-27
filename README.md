# toDO

Aplicação full-stack para gerenciamento de tarefas com quadro Kanban, autenticação JWT e integração com Google OAuth2.

## Stack

**Backend:** Java 17, Spring Boot 3.3.5, Spring Security 6, Spring Data JPA, Hibernate, JJWT 0.12.6, MySQL 8, Lombok, Maven

**Frontend:** Angular 18, standalone components, Angular CDK Drag and Drop, Reactive Forms, HttpClient

## Funcionalidades

- Autenticação stateless com JWT e login federado via Google OAuth2
- CRUD completo de tarefas com filtro por status, prioridade e categoria
- Quadro Kanban com drag and drop entre colunas de status
- Dashboard com métricas e calendário de prazos
- Gerenciamento de perfil com upload e editor de foto circular
- Exclusão de conta com remoção em cascata

## Endpoints

**Públicos**

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /auth/register | Registro com e-mail e senha |
| POST | /auth/login | Login com e-mail e senha |
| POST | /auth/google | Login com id\_token do Google |

**Protegidos — requer Bearer Token**

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /tarefas | Listar tarefas do usuário autenticado |
| POST | /tarefas | Criar tarefa |
| GET | /tarefas/{id} | Buscar tarefa por ID |
| PUT | /tarefas/{id} | Atualizar tarefa |
| PATCH | /tarefas/{id}/status | Atualizar status da tarefa |
| DELETE | /tarefas/{id} | Deletar tarefa |
| GET | /usuarios/me | Dados do usuário autenticado |
| PUT | /usuarios/me | Atualizar perfil |
| POST | /usuarios/me/foto | Upload de foto de perfil |
| DELETE | /usuarios/me/foto | Remover foto de perfil |
| DELETE | /usuarios/me | Deletar conta |

## Configuração local

**Pré-requisitos:** Java 17, Maven 3.9, Node 20, Angular CLI 18, MySQL 8

**Backend**

Crie o arquivo `backend/src/main/resources/application-local.properties` com suas credenciais locais — este arquivo está no `.gitignore` e nunca será versionado:

```properties
spring.datasource.username=root
spring.datasource.password=SUA_SENHA
jwt.secret=SUA_CHAVE_BASE64
```

```bash
cd backend
./mvnw spring-boot:run
```

**Frontend**

```bash
cd frontend
npm install
ng serve
```
