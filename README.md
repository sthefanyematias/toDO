
# toDO
<br>

Aplicacao full-stack para gerenciamento de tarefas com quadro Kanban, autenticacao JWT e integração com Google OAuth2.
<br>
<br>

## Stack
<br>

**Backend:** Java 17, Spring Boot 3.3.5, Spring Security 6, Spring Data JPA, Hibernate, JJWT 0.12.6, MySQL 8, Lombok, Maven
<br>
**Frontend:** Angular 18, standalone components, Angular CDK Drag and Drop, Reactive Forms, HttpClient
<br>
**Infra:** Docker, Render, Clever Cloud (MySQL)
<br>
<br>

## Funcionalidades
<br>

- Autenticacao stateless com JWT e login federado via Google OAuth2
- CRUD completo de tarefas com filtro por status, prioridade e categoria
- Quadro Kanban com drag and drop entre colunas de status
- Dashboard com metricas e calendario de prazos
- Gerenciamento de perfil com upload e editor de foto circular
- Exclusao de conta com remocao em cascata
<br>
<br>

## Endpoints
<br>

**Publicos**

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | /auth/register | Registro com e-mail e senha |
| POST | /auth/login | Login com e-mail e senha |
| POST | /auth/google | Login com id\_token do Google |
<br>

**Protegidos — requer Bearer Token**

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | /tarefas | Listar tarefas do usuario autenticado |
| POST | /tarefas | Criar tarefa |
| GET | /tarefas/{id} | Buscar tarefa por ID |
| PUT | /tarefas/{id} | Atualizar tarefa |
| PATCH | /tarefas/{id}/status | Atualizar status da tarefa |
| DELETE | /tarefas/{id} | Deletar tarefa |
| GET | /usuarios/me | Dados do usuario autenticado |
| PUT | /usuarios/me | Atualizar perfil |
| POST | /usuarios/me/foto | Upload de foto de perfil |
| DELETE | /usuarios/me/foto | Remover foto de perfil |
| DELETE | /usuarios/me | Deletar conta |
<br>
<br>

## Configuracao local
<br>

**Pre-requisitos:** Java 17, Maven 3.9, Node 20, Angular CLI 18, MySQL 8
<br>

**Backend**
<br>
Crie o arquivo `backend/src/main/resources/application-local.properties` com suas credenciais locais — este arquivo esta no `.gitignore` e nunca sera versionado:

```properties
spring.datasource.username=root
spring.datasource.password=SUA_SENHA
jwt.secret=SUA_CHAVE_BASE64
```

```bash
cd backend
./mvnw spring-boot:run
```
<br>

**Frontend**

```bash
cd frontend
npm install
ng serve
```
<br>
<br>

## Variaveis de ambiente — producao (Render)
<br>

| Variavel | Descricao |
|----------|-----------|
| DB\_URL | URL JDBC do MySQL no Clever Cloud |
| DB\_USERNAME | Usuario do banco |
| DB\_PASSWORD | Senha do banco |
| JWT\_SECRET | Chave Base64 para assinatura dos tokens |
| CORS\_ORIGINS | URL do frontend em producao |
<br>
<br>

## Branches
<br>

| Branch | Descricao |
|--------|-----------|
| main | Desenvolvimento local com MySQL local |
| deploy | Producao com Docker, Render e Clever Cloud |
