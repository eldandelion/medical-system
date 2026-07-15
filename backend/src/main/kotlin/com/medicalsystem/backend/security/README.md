# Security Layer ("Black Box" Authentication)

This package contains the decoupled authentication layer for the backend application.

## Overview
Currently, the system uses a **mock authentication** mechanism to facilitate frontend and backend development without requiring a full cryptographic JWT setup. 

Crucially, this mock logic is entirely isolated. Controllers and Services have absolutely zero knowledge of how tokens are parsed, matching how Spring Security natively operates. 

## How it Works

1. **`MockAuthenticationFilter`**: 
   - Intercepts incoming HTTP requests before they reach the controllers.
   - Extracts the `Authorization` header.
   - Resolves a mock `User` based on hardcoded string matching (e.g., `"teacher_token_zhang"`, `"doctor"`).
   - Stores the resolved user in a thread-local context.
   
2. **`MockSecurityContextHolder`**:
   - Safely holds the authenticated `User` for the lifespan of the current request thread.
   - Automatically cleared after the request finishes to prevent memory leaks and state pollution.

3. **`@CurrentUser` & `CurrentUserArgumentResolver`**:
   - A Spring `HandlerMethodArgumentResolver` that intercepts controller parameters annotated with `@CurrentUser`.
   - Retrieves the `User` from the `MockSecurityContextHolder` and injects it into the controller method.

## Usage in Controllers

Never parse the `Authorization` header manually. Simply ask for the user:

```kotlin
@PostMapping("/example")
fun doSomething(@CurrentUser user: User?): ResponseEntity<Void> {
    if (user == null) throw ForbiddenException("Not authenticated")
    
    // Pass the user down to the service layer
    myService.performAction(user)
    return ResponseEntity.ok().build()
}
```

## Future Migration to Spring Security

Because the business logic and controllers are already perfectly decoupled, upgrading to real Spring Security (e.g., JWT) in production will be seamless:

1. Add the `spring-boot-starter-security` dependency.
2. Delete `MockAuthenticationFilter.kt` and `MockSecurityContextHolder.kt`.
3. Replace them with a standard `JwtAuthenticationFilter` that sets Spring's native `SecurityContextHolder`.
4. Update `CurrentUserArgumentResolver.kt` to extract the principal from Spring's `SecurityContextHolder` instead of our mock holder.
5. **Zero changes** will be required in the Controllers or Services!
