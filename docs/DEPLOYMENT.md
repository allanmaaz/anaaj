# 🚀 Deployment Guide — Anaaj Platform

To deploy the **Anaaj** platform for your final presentation, follow these steps to bundle the React frontend and Java backend into a single, production-ready **WAR** file.

---

## 🛠️ Phase 1: Build the Frontend (React)
The frontend needs to be "compiled" into static files that the Java server can serve.

1.  Open your terminal in the `frontend` folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies (if not already done):
    ```bash
    npm install
    ```
3.  Create the production build:
    ```bash
    npm run build
    ```
    *This creates a `dist` folder inside `frontend/`.*

---

## 📦 Phase 2: Bundle into Java Backend
Since we want a single deployment file, we will move the frontend into the Java web application folder.

1.  **Clear old files**: Ensure your `src/main/webapp` folder is empty (except for `WEB-INF`).
2.  **Copy Dist**: Move everything from `frontend/dist/` into `src/main/webapp/`.
    *On Mac/Linux:*
    ```bash
    cp -r frontend/dist/* src/main/webapp/
    ```

---

## 🏗️ Phase 3: Package the WAR File
Now, use Maven to create the final application package.

1.  In the **root directory** of the project (`mini/`):
    ```bash
    mvn clean package
    ```
2.  Wait for the "BUILD SUCCESS" message.
3.  Your deployment file is now ready at:
    `target/AnaajApp.war`

---

## 🚢 Phase 4: Deploy to Tomcat
1.  Start your **Apache Tomcat 10** server.
2.  Copy the `AnaajApp.war` file into the Tomcat `webapps/` directory.
3.  Access the app at:
    `http://localhost:8080/AnaajApp`

---

### 💡 Pro Tips for Presentation:
- **H2 Console**: You can view the live database at `http://localhost:8080/AnaajApp/h2-console`.
- **Admin Access**: Use `admin@anaaj.com` / `admin123` to show the Master Dashboard.
- **Responsive Proof**: Open the link on a phone or use Chrome DevTools to show the "Elite" mobile polish.

---
*Anaaj — 2026 Mini Project Milestone*
