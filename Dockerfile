# Use a lightweight Node.js image
# Or your preferred Node.js LTS version
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy pnpm-lock.yaml and package.json first to leverage Docker's build cache
COPY package.json pnpm-lock.yaml ./

# --- ADDED STEP: Install pnpm globally within the container ---
RUN npm install -g pnpm

# Install pnpm dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Expose the Vite development server port
EXPOSE 5173

# Start the Vite development server
CMD ["pnpm", "run", "dev", "--", "--host"]