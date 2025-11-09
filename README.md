# Mini Calc Chain Webapp

This is a Next.js application that allows users to create chains of mathematical operations.

## Features

- User authentication (signup, login, logout)
- Create, view, and delete chains of operations
- Add operations to existing chains
- Nested operations

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework for building server-side rendered and static web applications
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [Mongoose](https://mongoosejs.com/) - Object Data Modeling (ODM) library for MongoDB and Node.js
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable components built using Radix UI and Tailwind CSS.
- [Zustand](https://zustand-demo.pmnd.rs/) - Small, fast and scalable bearbones state-management solution
- [Biome](https://biomejs.dev/) - A toolchain for web projects, designed to replace Babel, ESLint, webpack, Prettier, Jest, and others.
- [Docker](https://www.docker.com/) - A platform for developing, shipping, and running applications in containers

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- pnpm
- Docker

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-username/mini-calc-chain-webapp.git
    ```

2.  Install dependencies:

    ```bash
    pnpm install
    ```

3.  Create a `.env.local` file in the root of the project and add the following environment variables:

    ```
    JWT_SECRET_KEY=<your-jwt-secret>
    MONGODB_URI=mongodb://localhost:27017/calc-chain OR <your-MongoDB-connection-string>
    ```

### Running the application

You can run the application in two ways:

**1. Using `pnpm`**

```bash
pnpm dev
```

**2. Using `docker-compose`**

```bash
docker compose up --build -d
docker compose up
```

This will start the Next.js development server and a MongoDB container.

## API Endpoints

### Auth

- `POST /api/auth/signup`: Create a new user
- `POST /api/auth/login`: Log in a user
- `GET /api/auth/logout`: Log out a user

### Chains

- `GET /api/chains`: Get all chains
- `GET /api/chains?authorId=<authorId>`: Get all chains by a specific author
- `GET /api/chains?chainId=<chainId>`: Get a specific chain by its ID
- `POST /api/protected/chain`: Create a new chain (protected)
- `DELETE /api/protected/chain?id=<chainId>`: Delete a chain (protected)

### Operations

- `POST /api/protected/operation`: Add an operation to a chain (protected)
- `DELETE /api/protected/operation?id=<operationId>`: Delete an operation (protected)

### User

- `GET /api/protected/me`: Get the currently logged-in user's data (protected)

## Folder Structure

```
.
├───src
│   ├───app
│   │   ├───(auth)      # Authentication pages
│   │   ├───(public)    # Public pages
│   │   └───api         # API routes
│   ├───components  # React components
│   ├───hooks       # React hooks
│   ├───lib         # Library files (e.g., database connection)
│   ├───models      # Mongoose models
│   └───store       # Zustand stores
├───public          # Public assets
...
```
