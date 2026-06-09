# Sistema de Gestión de Biblioteca — Desafío Técnico Azurian

Aplicación full-stack para la gestión de una biblioteca: libros, autores, clientes y préstamos.  
Construida con **Spring Boot 3 · Angular 19 · Keycloak 24 · PostgreSQL 16 · Docker Compose**.

---

## Tabla de Contenidos

1. [Descripción general](#descripción-general)
2. [Stack tecnológico](#stack-tecnológico)
3. [Entidades y relaciones](#entidades-y-relaciones)
4. [Requisitos previos](#requisitos-previos)
5. [Inicio rápido — Docker Compose](#inicio-rápido--docker-compose)
6. [Desarrollo local sin Docker](#desarrollo-local-sin-docker)
7. [Compilar los proyectos](#compilar-los-proyectos)
8. [Tests y cobertura](#tests-y-cobertura)
9. [Endpoints de la API](#endpoints-de-la-api)
10. [Reglas de validación](#reglas-de-validación)
11. [Decisiones de arquitectura](#decisiones-de-arquitectura)
12. [Estructura del proyecto](#estructura-del-proyecto)

---

## Descripción general

El sistema permite a los administradores de una biblioteca gestionar su catálogo completo a través de una interfaz web en español. Las funcionalidades principales son:

| Módulo | Operaciones |
|--------|------------|
| **Libros** | Crear, editar y eliminar libros; asignar categoría y uno o más autores; controlar copias disponibles |
| **Autores** | Crear, editar y eliminar autores; validación que impide eliminar un autor con libros asociados |
| **Clientes** | Registrar y gestionar los socios de la biblioteca |
| **Préstamos** | Registrar la salida y devolución de libros; filtrar por estado (Activo / Devuelto / Vencido) |
| **Categorías** | Catálogo de géneros literarios utilizado como selección en el formulario de libros |

### Características destacadas

- **Autenticación con Keycloak** (OIDC / PKCE code flow) — los endpoints de escritura requieren JWT válido.
- **Perfil `local`** para desarrollo sin Keycloak: todos los endpoints quedan accesibles sin token.
- **Migraciones declarativas** con Liquibase; la base de datos se inicializa con datos de muestra al primer arranque.
- **Documentación de API** automática con OpenAPI 3 / Swagger UI en `/swagger-ui.html`.
- **Cobertura de código**: JaCoCo ≥ 80% en el backend, Jest ≥ 80% en el frontend.
- **Interfaz en español** con Angular Material, validaciones en tiempo real y datepickers nativos.
- **Búsqueda y paginación** en todos los listados (página, tamaño, campo de ordenamiento).

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Java 21, Spring Boot 3.3.5 |
| Persistencia | Spring Data JPA, Hibernate 6, PostgreSQL 16 |
| Migraciones | Liquibase |
| Seguridad | Spring Security OAuth2 Resource Server, Keycloak 24 (OIDC) |
| Documentación API | SpringDoc OpenAPI 3 / Swagger UI |
| Mapeo de objetos | MapStruct 1.6.2 |
| Boilerplate | Lombok 1.18.34 |
| Cobertura backend | JaCoCo 0.8.12 (mínimo 80%) |
| Frontend | Angular 19 (standalone), Angular Material 19 |
| Autenticación FE | angular-oauth2-oidc (PKCE code flow) |
| Cobertura frontend | Jest + jest-preset-angular (mínimo 80%) |
| Infraestructura | Docker Compose 2.x, Nginx (sirve SPA + proxy `/api`) |

---

## Entidades y relaciones

```
Category  ──<  Book  >──  Author
                │
              Loan
                │
             Client
```

| Relación | Tipo | Descripción |
|----------|------|-------------|
| `Category` → `Book` | 1:N | Una categoría puede tener muchos libros |
| `Book` ↔ `Author` | N:M | Tabla pivote `book_authors`; un libro puede tener varios autores |
| `Client` → `Loan` | 1:N | Un cliente puede tener múltiples préstamos |
| `Book` → `Loan` | 1:N | Un libro puede aparecer en múltiples préstamos (histórico) |

**Estados de préstamo:** `ACTIVE` · `RETURNED` · `OVERDUE`

---

## Requisitos previos

**Opción Docker (recomendada):**
- Docker Engine ≥ 24 y Docker Compose ≥ 2.x

**Opción local:**
- Java 21+
- Maven 3.9+
- Node.js 20+ y npm 10+
- PostgreSQL 16+ (con base de datos `library` y usuario `library_user`)

---

## Inicio rápido — Docker Compose

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd azurian-challenge

# 2. Levantar todos los servicios
docker compose up --build
```

El primer arranque tarda ~2 minutos mientras Keycloak importa el realm. Los healthchecks de Compose garantizan el orden correcto: PostgreSQL → Keycloak → Backend → Frontend.

| Servicio | URL |
|---------|-----|
| Frontend (SPA) | http://localhost:4200 |
| Backend (API) | http://localhost:8080/api/v1 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Keycloak Admin | http://localhost:8180 (admin / admin) |

### Usuarios de prueba (realm `library`)

| Usuario | Contraseña | Roles |
|---------|-----------|-------|
| `admin` | `admin123` | `library-admin`, `library-user` |
| `user1` | `user123` | `library-user` |

---

## Desarrollo local sin Docker

### Backend — modo local (sin Keycloak)

El perfil `local` desactiva la validación JWT: todos los endpoints quedan abiertos sin token. Ideal para desarrollo y pruebas rápidas.

```bash
cd biblioteca-backend

# Requiere PostgreSQL local con:
#   DB: library  |  usuario: library_user  |  contraseña: library_pass

mvn spring-boot:run -Dspring-boot.run.profiles=local
# API disponible en:   http://localhost:8080/api/v1
# Swagger UI en:       http://localhost:8080/swagger-ui.html
```

### Backend — modo producción (con Keycloak)

```bash
cd biblioteca-backend

export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/library
export SPRING_DATASOURCE_USERNAME=library_user
export SPRING_DATASOURCE_PASSWORD=library_pass
export KEYCLOAK_ISSUER_URI=http://localhost:8180/realms/library

mvn spring-boot:run
```

### Frontend

```bash
cd biblioteca-frontend

npm install --legacy-peer-deps

# Servidor de desarrollo con proxy al backend en :8080
npm start
# App disponible en: http://localhost:4200
```

El proxy (`proxy.conf.json`) redirige `/api` → `http://localhost:8080/api`, evitando problemas de CORS en desarrollo.

---

## Compilar los proyectos

### Backend — genera JAR ejecutable

```bash
cd biblioteca-backend
mvn clean package -DskipTests
# Artefacto: target/library-1.0.0.jar
```

### Frontend — bundle de producción

```bash
cd biblioteca-frontend
npm run build:prod
# Artefacto: dist/library-frontend/
```

---

## Tests y cobertura

### Backend — JUnit 5 + Mockito + JaCoCo

```bash
cd biblioteca-backend

# Ejecutar tests y generar reporte de cobertura
mvn clean verify

# Reporte HTML:
# target/site/jacoco/index.html
```

> **Umbral obligatorio:** JaCoCo falla el build si la cobertura de instrucciones cae por debajo del **80%**.  
> Las clases excluidas del umbral son: entidades de dominio, DTOs y la clase principal `LibraryApplication` (sin lógica de negocio).

### Frontend — Jest + jest-preset-angular

```bash
cd biblioteca-frontend

# Ejecutar tests
npm test

# Tests con reporte de cobertura
npm run test:coverage

# Reporte HTML:
# coverage/index.html
```

> **Umbral obligatorio:** Jest falla si branches, functions, lines o statements caen por debajo del **80%**.

---

## Endpoints de la API

Todos los endpoints tienen el prefijo `/api/v1`.

**Autenticación:** los endpoints `GET` son públicos. `POST`, `PUT` y `DELETE` requieren header `Authorization: Bearer <token>` con JWT emitido por Keycloak. En el perfil `local` todos los endpoints son accesibles sin token.

### Libros — `/books`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/books` | Lista paginada (`page`, `size`, `sortBy`, `sortDir`, `search`) |
| GET | `/books/{id}` | Detalle de un libro |
| POST | `/books` | Crear libro |
| PUT | `/books/{id}` | Actualizar libro |
| DELETE | `/books/{id}` | Eliminar libro |

### Autores — `/authors`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/authors` | Lista paginada |
| GET | `/authors/{id}` | Detalle |
| POST | `/authors` | Crear autor |
| PUT | `/authors/{id}` | Actualizar autor |
| DELETE | `/authors/{id}` | Eliminar (falla si tiene libros asociados) |

### Clientes — `/clients`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/clients` | Lista paginada |
| GET | `/clients/{id}` | Detalle |
| POST | `/clients` | Crear cliente |
| PUT | `/clients/{id}` | Actualizar cliente |
| DELETE | `/clients/{id}` | Eliminar cliente |

### Préstamos — `/loans`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/loans` | Lista paginada; filtrar por `status=ACTIVE\|RETURNED\|OVERDUE` |
| GET | `/loans/{id}` | Detalle |
| POST | `/loans` | Registrar préstamo |
| PUT | `/loans/{id}` | Actualizar / registrar devolución |
| DELETE | `/loans/{id}` | Eliminar préstamo |

### Categorías — `/categories`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/categories` | Lista completa |
| POST | `/categories` | Crear categoría |
| PUT | `/categories/{id}` | Actualizar categoría |
| DELETE | `/categories/{id}` | Eliminar categoría |

---

## Reglas de validación

Las validaciones se aplican en **ambas capas**: frontend (Angular Reactive Forms) y backend (Bean Validation / Jakarta).

### Libro (`BookRequest`)

| Campo | Regla |
|-------|-------|
| `title` | Requerido, máximo 255 caracteres |
| `isbn` | Formato `^[0-9Xx\-\s]{9,17}$` — acepta ISBN-10, ISBN-13 con o sin guiones |
| `publishedYear` | Entero de 4 dígitos, rango 1000–9999 |
| `availableCopies` | Requerido, entero 0–999 (máximo 3 dígitos) |
| `synopsis` | Máximo 1000 caracteres |

### Autor (`AuthorRequest`)

| Campo | Regla |
|-------|-------|
| `firstName` | Requerido, 2–100 caracteres, solo letras (incluye acentos, `'`, `-`) |
| `lastName` | Requerido, 2–100 caracteres, solo letras |
| `nationality` | Opcional, solo letras |
| `birthDate` | Opcional, no puede ser fecha futura |

### Cliente (`ClientRequest`)

| Campo | Regla |
|-------|-------|
| `firstName` | Requerido, solo letras (incluye acentos, `'`, `-`) |
| `lastName` | Requerido, solo letras |
| `email` | Formato email válido, requerido |
| `phone` | Formato `^[+]?[0-9\s\-(). ]{7,20}$` (opcional) |

### Préstamo (`LoanRequest`)

| Campo | Regla |
|-------|-------|
| `bookId` | Requerido |
| `clientId` | Requerido |
| `dueDate` | Requerido; **debe ser fecha futura** al crear (validación manual en el servicio); sin restricción al actualizar/devolver |

---

## Decisiones de arquitectura

### Backend

#### Arquitectura en capas
Controller → Service (interfaz + implementación) → Repository. Cada capa se comunica solo con la inmediatamente inferior, lo que facilita el testing unitario con mocks y permite reemplazar implementaciones sin modificar contratos.

#### Separación de métodos de repositorio en lugar de null-check en JPQL
La consulta JPQL con patrón `:param IS NULL OR campo LIKE :param` provoca en PostgreSQL el error `operator does not exist: lower(bytea)` porque Hibernate/Spring Data infiere el tipo del parámetro nulo como `bytea`. La solución fue dividir cada repositorio en **dos métodos distintos**: uno sin filtro (retorna todo) y otro con `WHERE LOWER(...) LIKE :search`, y dejar al servicio la responsabilidad de invocar el correcto según si el parámetro es nulo o no.

#### MapStruct + Lombok — orden del procesador de anotaciones
MapStruct necesita que Lombok haya generado los constructores y getters antes de que él genere los mappers. En el `pom.xml` el procesador de Lombok se declara **antes** que el de MapStruct dentro de `<annotationProcessorPaths>` para garantizar el orden de compilación.

#### Validación de `@Future` solo al crear
La anotación `@Future` sobre `dueDate` en el DTO se aplica en todas las operaciones (crear y actualizar). Al devolver un libro cuya fecha de vencimiento ya pasó, el backend rechazaba la petición con 400. La solución fue eliminar `@Future` del DTO y replicar la validación manualmente en `LoanServiceImpl.create()` únicamente.

#### Manejo centralizado de errores
`GlobalExceptionHandler` (`@RestControllerAdvice`) captura `ResourceNotFoundException` → 404, `BusinessException` → 409, errores de validación Bean Validation → 400 con detalle por campo, y cualquier excepción no controlada → 500. Todos los errores siguen el mismo contrato JSON con `timestamp`, `status`, `message`.

#### Perfil `local` para desarrollo sin Keycloak
`LocalSecurityConfig` activa con `@Profile("local")` y configura `.permitAll()` en todos los endpoints, ignorando la cadena de filtros JWT. Esto permite trabajar en desarrollo sin necesidad de una instancia de Keycloak corriendo.

### Frontend

#### Angular 19 standalone sin NgModules
Todos los componentes son `standalone: true`. Los imports se declaran por componente en lugar de módulos, lo que permite tree-shaking más agresivo y elimina la complejidad de los módulos de funcionalidades.

#### `provideNativeDateAdapter()` en app.config.ts
En Angular 19 standalone, `MatDatepicker` no puede abrir el overlay del calendario si no hay un `DateAdapter` registrado a nivel de aplicación. Es necesario incluir `provideNativeDateAdapter()` en el array de `providers` de `appConfig`; registrarlo solo en el componente no es suficiente.

#### authGuard asíncrono con Observable
Keycloak requiere un discovery document asíncrono para inicializarse. El guard devuelve un `Observable<boolean>` que usa `filter(initialized => initialized)` + `take(1)` para esperar a que `AuthService.initAuth()` complete antes de decidir si permite o bloquea la ruta. Sin esto, el guard tomaba decisiones de redirección antes de saber si Keycloak estaba disponible, dejando la pantalla en blanco.

#### Inputs numéricos con `type="text"` + `inputmode="numeric"`
`maxlength` no funciona sobre `<input type="number">`. Para limitar el año a 4 dígitos y las copias a 3 dígitos se usa `type="text"` con `inputmode="numeric"` (muestra teclado numérico en móvil), `maxlength` y un handler `(keypress)` que bloquea teclas no numéricas. El formulario almacena el valor como string y lo convierte con `parseInt()` al construir el request.

#### Validación de eliminación de autor con libros asociados
Eliminar un autor que tiene libros asociados viola la constraint FK `fk_book_authors_author` y PostgreSQL lanza un error 500 genérico. El servicio verifica `author.getBooks().isEmpty()` antes de ejecutar el delete y lanza una `BusinessException` con un mensaje descriptivo en español, que el frontend muestra como snackbar de error.

### Infraestructura

#### Healthchecks y orden de arranque en Docker Compose
El backend depende de `postgres: condition: service_healthy` y `keycloak: condition: service_healthy`. El frontend depende de `backend: condition: service_healthy`. Esto garantiza que ningún servicio intente conectarse antes de que sus dependencias estén listas, evitando errores de conexión durante el arranque en frío.

#### Nginx como servidor del SPA
En producción, Nginx sirve los archivos estáticos del bundle Angular y actúa como reverse-proxy para `/api/` → `backend:8080`. El archivo `nginx.conf` incluye el fallback `try_files $uri $uri/ /index.html` necesario para el router de Angular.

#### Variables de entorno para configuración
Todos los secretos y parámetros de entorno (URL de base de datos, contraseñas, URIs de Keycloak, CORS) se inyectan mediante variables de entorno. No hay credenciales hardcodeadas en el código fuente.

---

## Estructura del proyecto

```
.
├── biblioteca-backend/                 # Aplicación Spring Boot
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/azurian/library/
│       │   │   ├── config/             # SecurityConfig, LocalSecurityConfig, OpenApiConfig
│       │   │   ├── controller/         # REST controllers (Book, Author, Client, Loan, Category)
│       │   │   ├── domain/             # Entidades JPA (Book, Author, Client, Loan, Category)
│       │   │   ├── dto/
│       │   │   │   ├── request/        # BookRequest, AuthorRequest, ClientRequest, LoanRequest
│       │   │   │   └── response/       # BookResponse, AuthorResponse, etc.
│       │   │   ├── exception/          # GlobalExceptionHandler, BusinessException, ResourceNotFoundException
│       │   │   ├── mapper/             # Interfaces MapStruct
│       │   │   ├── repository/         # Spring Data JPA repositories
│       │   │   └── service/            # Interfaces + implementaciones de negocio
│       │   └── resources/
│       │       ├── application.yml
│       │       ├── application-local.yml
│       │       ├── logback-spring.xml
│       │       └── db/changelog/       # Migraciones Liquibase + datos de muestra
│       └── test/                       # Tests unitarios JUnit 5 + Mockito
│
├── biblioteca-frontend/                # SPA Angular 19
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── proxy.conf.json                 # Proxy /api → localhost:8080 en desarrollo
│   └── src/app/
│       ├── app.config.ts               # Providers globales (router, http, auth, datepicker)
│       ├── core/
│       │   ├── guards/                 # authGuard (Observable, espera inicialización)
│       │   ├── interceptors/           # authInterceptor (inyecta Bearer token)
│       │   ├── models/                 # Interfaces TypeScript
│       │   └── services/              # AuthService, BookService, AuthorService, etc.
│       ├── features/
│       │   ├── books/                  # BookListComponent, BookFormDialogComponent
│       │   ├── authors/                # AuthorListComponent, AuthorFormDialogComponent
│       │   ├── clients/                # ClientListComponent, ClientFormDialogComponent
│       │   └── loans/                  # LoanListComponent, LoanFormDialogComponent
│       └── shared/
│           └── confirm-dialog/         # Diálogo de confirmación reutilizable
│
├── keycloak/
│   └── realm-library.json              # Configuración del realm (importación automática)
│
├── scripts/
│   └── init-databases.sh               # Crea las bases de datos library y keycloak en PostgreSQL
│
└── docker-compose.yml
```
