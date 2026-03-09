<div align="center">
<img width="1200" height="475" alt="Gemini AI Dockerized App - Dev Fabian Custom Build" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Deploy Your AI Studio App (Dockerized)
**Custom Build & Optimization by Dev Fabian**

This repository contains everything you need to run your Google AI Studio app as a fully containerized, production-ready application. This version is optimized for stability, quick deployment, and includes a secure admin gate.

> This deployment package wraps your existing application. View the original app structure here:
> [View in AI Studio](https://ai.studio/apps/36d26e3d-7d31-4403-9f0e-9617d3db705f)

## 🔑 Admin Credentials (Required)

To protect your API usage and access the application, you must log in with the default secure credentials:

* **Username:** `admin`
* **Password:** `admin`

> *Note: For security, it is highly recommended to change these in the source code before deploying to a public VPS.*

---

## 🚀 Recommended Deployment: Docker (VPS or Local)

The fastest and most stable method is using Docker. It handles all dependencies automatically.

**Prerequisites:** Docker and Docker Compose installed.

1.  **Configure Environment:** Create a `.env.local` file in the root directory and add your key:
    ```env
    GEMINI_API_KEY=your_actual_gemini_api_key_here
    PORT=3000
    ```
2.  **Build and Run:** Run the following command in your terminal:
    ```bash
    docker-compose up -d --build
    ```
3.  **Access App:** Your app will be live at `http://localhost:3000`.

---

## 💻 Alternative: Run Locally (Manual)

If you prefer not to use Docker, ensure you have **Node.js** installed.

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Set Environment:** Ensure `.env.local` contains your `GEMINI_API_KEY`.
3.  **Run the app:**
    ```bash
    npm run dev
    ```

***

**Developed by 💡 Dev Fabian** *Support: Contact via Gumroad for technical inquiries.*
