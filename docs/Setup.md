# Setup Guide

## Requirements
- Node.js >= 18
- pnpm >= 9
- Docker & Docker Compose

## Quickstart

1. **Copy Mercur packages and initialize git**:
   Run the included `run_all.bat` script in the root directory:
   ```cmd
   run_all.bat
   ```

2. **Start Infrastructure**:
   ```bash
   docker compose up -d
   ```

3. **Install dependencies**:
   ```bash
   pnpm install
   ```

4. **Run migrations & generate Prisma client**:
   ```bash
   pnpm --filter @equation-orchestra/database prisma:generate
   ```

5. **Start Dev Mode**:
   ```bash
   pnpm dev
   ```
