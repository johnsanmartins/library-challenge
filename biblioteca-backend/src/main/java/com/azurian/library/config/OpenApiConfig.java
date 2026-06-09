package com.azurian.library.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.OAuthFlow;
import io.swagger.v3.oas.models.security.OAuthFlows;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Value("${keycloak.auth-server-url:http://localhost:8180}/realms/${keycloak.realm:library}/protocol/openid-connect")
    private String oidcBaseUrl;

    @Bean
    public OpenAPI openAPI() {
        final String securitySchemeName = "oauth2";
        return new OpenAPI()
                .info(new Info()
                        .title("Azurian Library API")
                        .description("Library Management System REST API")
                        .version("1.0.0"))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                                .type(SecurityScheme.Type.OAUTH2)
                                .flows(new OAuthFlows()
                                        .authorizationCode(new OAuthFlow()
                                                .authorizationUrl(oidcBaseUrl + "/auth")
                                                .tokenUrl(oidcBaseUrl + "/token")))));
    }
}
