# Stage 1: Build stage
FROM maven:3.8.8-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy parent POM and employee-service directory to maintain the parent-relative structure
COPY backend/pom.xml backend/pom.xml
COPY backend/employee-service backend/employee-service

# Package the application (skipping tests for faster build)
RUN mvn -f backend/employee-service/pom.xml clean package -DskipTests

# Stage 2: Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/backend/employee-service/target/employee-service-1.0.0-SNAPSHOT.jar app.jar

# Expose the application port
EXPOSE 8020

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]
