# Build stage
# Specify the build stage base image
FROM sbtscala/scala-sbt:graalvm-community-21.0.2_1.9.8_3.3.1 as build

# Set the working directory
WORKDIR /app

# Copy the application code
COPY . .

# Run sbt commands to clean, update, and collect jars
RUN sbt clean update resetDatabase collectJars

# Runtime stage
# Specify the deploy stage base image
FROM openjdk:23-jdk-slim as deploy

# Sets the user id and group id as arguments
ARG UID=1001
ARG GID=1001

# Update the package list, install sudo, create a non-root user, and grant password-less sudo permissions
RUN apt-get update && \
    apt-get install -y --no-install-recommends sudo && \
    addgroup --gid ${GID} nonroot && \
    adduser --uid ${UID} --gid ${GID} --disabled-password --gecos "" nonroot && \
    echo 'nonroot ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /home/nonroot/app

# Copy jar files from the build stage
COPY --from=build /app/target/universal/jars/* .

# Copy files into the container and set the appropriate permissions
RUN chown -R nonroot:nonroot .
RUN chmod -R 755 /home/nonroot/app

# Switch to nonroot user
USER nonroot

# Expose port 9000
EXPOSE 9000

# Start the application
CMD java -cp './*' ihrm.Server