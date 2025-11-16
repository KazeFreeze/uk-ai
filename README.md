# uk-ai: AI-Powered Thrifting Stylist

This project is an MVP for an AI-powered fashion application. It uses a Next.js frontend and a local AI service (Ollama) running `llava:7b` (Large Language-and-Vision Assistant) to analyze clothing images and generate outfit suggestions.

## Prerequisites

- **Docker Desktop** (Required for running the AI service)
- **Node.js 18+** (Required for local frontend development)

## Configuration

### 1. Environment Setup (.env.local)

To run the Next.js app locally while connecting to the Dockerized AI, create a file named `.env.local` in the root directory:
```env
# .env.local
# Points to the exposed Docker port (11435) for local dev
OLLAMA_HOST=http://localhost:11435
```

### 2. Docker Configuration

The `docker-compose.yml` is configured to:

- Run Ollama on port **11435** (mapped to internal 11434).
- Automatically pull and serve the `llava:7b` model on startup.
- Host the Next.js app on port **3000**.

## Development Workflows

You can run this project in two ways depending on your needs.

### Option A: Hybrid Development (Recommended for Frontend Dev)

Run the AI in Docker (stable) but the App locally (fast iteration).

1. **Start the AI Service Only:**
```bash
   docker-compose up ollama
```

   > **Note:** The first time you run this, it may take a few minutes to download the `llava:7b` model (approx 4GB).

2. **Run Next.js Locally:**

   Open a new terminal window and run:
```bash
   npm install
   npm run dev
```

3. **Access the App:**

   Go to [http://localhost:3000](http://localhost:3000). The app will connect to the AI at `http://localhost:11435`.

### Option B: Full Docker Mode (Production Simulation)

Run everything inside containers.

1. **Start All Services:**
```bash
   docker-compose up --build
```

2. **Access the App:**

   Go to [http://localhost:3000](http://localhost:3000).

   In this mode, the app talks to the AI via the internal Docker network (`http://ollama:11434`).

## Models Used

### Unified Model: `llava:7b`

Used for both:
- **Visual Analysis** (analyzing uploaded images)
- **Text Processing** (interpreting style themes)

This reduces bandwidth and storage requirements by relying on a single multimodal model.
