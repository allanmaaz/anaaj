# ── Frontend Build Stage ─────────────────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ── Backend Build Stage ──────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Create webapp folder and copy frontend build into it
RUN mkdir -p src/main/webapp
COPY --from=frontend-build /frontend/dist src/main/webapp/

# Build backend
RUN mvn clean package -DskipTests

# ── Run Stage ────────────────────────────────────────────────────
FROM tomcat:10.1-jdk17-temurin
WORKDIR /usr/local/tomcat

# Remove default Tomcat apps
RUN rm -rf webapps/*

# Copy the WAR file from the build stage to the Tomcat webapps folder
COPY --from=build /app/target/AnaajApp.war ./webapps/ROOT.war

EXPOSE 8080
CMD ["catalina.sh", "run"]
