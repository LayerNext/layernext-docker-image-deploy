# Use an official Python runtime as a base image
FROM python:3.8

# Set the working directory
WORKDIR /app

# Install the Milvus Python SDK
RUN pip install pymilvus

# Copy the current directory contents into the container
COPY . /app

# Set the command to run your Python script
CMD ["python", "milvus_initialize.py"]
