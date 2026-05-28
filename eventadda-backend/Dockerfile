# Stage 1: Build stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build package skipping unit tests
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy built jar from stage 1
COPY --from=build /app/target/eventadda-backend-0.0.1-SNAPSHOT.jar app.jar

# Expose port 8082
EXPOSE 8082

# Start the application
ENTRYPOINT ["java", "-jar", "app.jar"]
