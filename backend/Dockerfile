FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Set environment variables (replace with your actual variables)
ENV OPENAI_API_KEY="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"

# Copy the rest of the application code
COPY . .

# Expose the FastAPI port
EXPOSE 8000

# Start the FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "debug"]