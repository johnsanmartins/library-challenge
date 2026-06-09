FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN apk add --no-cache maven && mvn clean package -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S library && adduser -S library -G library
COPY --from=builder /app/target/*.jar app.jar
RUN chown library:library app.jar
USER library
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
