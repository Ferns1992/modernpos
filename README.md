# Modern POS & Inventory Management System

A full-stack, responsive Point of Sale (POS) and Inventory Management system built with React, Express, and SQLite. Designed for small to medium-sized businesses, it features real-time kitchen displays, automated reporting, and offline-first capabilities.

## 🚀 Key Features

- **Point of Sale (POS):** Fast, intuitive checkout interface with cart management and multiple payment methods.
- **Inventory Management:** Track stock levels, manage categories, and receive low-stock alerts.
- **Kitchen Display System (KDS):** Real-time order tracking for kitchen staff with **audible alerts** for new orders.
- **Reporting & Analytics:** Generate sales reports, inventory summaries, and export data to PDF or CSV.
- **Branch Management:** Support for multiple branches with role-based access control (Admin, Cashier, KDS).
- **Offline Support:** Local data persistence and synchronization when back online.
- **Dark Mode:** Fully responsive UI with seamless dark/light mode switching.

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons, Motion (Framer Motion).
- **Backend:** Node.js, Express.
- **Database:** SQLite (via `better-sqlite3`) for lightweight, reliable persistence.
- **Deployment:** Docker & Docker Compose.

## 📦 Deployment

### Using Docker Compose

1. Clone the repository.
2. Run the following command:
   ```bash
   docker-compose up -d
   ```
3. Access the app at `http://localhost:4000`.

### Using Portainer (Stack / Swarm Mode)

1. **Fix Ingress Network (Required if you get "ingress network not present" error):**
   Run this command on your server's terminal:
   ```bash
   docker network create --driver overlay --ingress ingress
   ```
2. Create a new Stack in Portainer.
3. Select "Repository" as the build method.
4. Use the repository URL and set the target to `docker-compose.yml`.
5. Deploy the stack.

> [!NOTE]
> If you still get ingress errors, the `docker-compose.yml` is now configured to use `mode: host` for ports, which bypasses the ingress network.

## 💻 Local Development

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Start Development Server:**
   ```bash
   npm run dev
   ```
3. **Build for Production:**
   ```bash
   npm run build
   npm start
   ```

## 📄 Environment Variables

Define these in a `.env` file or your Docker environment:
- `PORT`: Port to run the server on (default: 4000).
- `DATABASE_PATH`: Path to the SQLite database file (default: `pos.db`).
- `NODE_ENV`: Set to `production` for optimized builds.

## 🛡️ Security & Access

The application uses role-based access control. Default roles include:
- **Admin:** Full access to settings, logs, and reports.
- **Cashier:** Access to POS and pending orders.
- **KDS:** Access to the Kitchen Display System.

### Default Credentials
| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin` |

> [!IMPORTANT]
> It is highly recommended to change the default password immediately after the first login via the Admin settings.

---
Built with ❤️ for modern businesses.
