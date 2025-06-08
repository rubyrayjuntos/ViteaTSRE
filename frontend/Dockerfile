# Use a lightweight Node.js image
FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable && \
    corepack prepare pnpm@latest --activate && \
    export PATH="/usr/local/bin:$PATH"


# Install pnpm dependencies
RUN pnpm install --no-frozen-lockfile  

# Copy the rest of the application code
COPY . .

RUN pnpm build

EXPOSE 5000

CMD ["pnpm", "start"]  # Use the script defined in package.json
