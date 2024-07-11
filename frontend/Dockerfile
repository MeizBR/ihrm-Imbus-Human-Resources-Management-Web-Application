# Build stage
# Stage 1: Build the Angular application
FROM node:12.22.12-buster-slim as build

# # Update packages and install ps
# RUN apt-get update && apt install -y procps

# # Install wget and unzip
# RUN apt-get update && apt-get install -y wget unzip

# # Install Google Chrome
# ARG CHROME_VERSION="114.0.5735.90"

# RUN wget --no-verbose -O /tmp/chrome.deb https://dl.google.com/linux/chrome/deb/pool/main/g/google-chrome-stable/google-chrome-stable_${CHROME_VERSION}-1_amd64.deb \
#   && apt-get install -y /tmp/chrome.deb \
#   && rm /tmp/chrome.deb

# # Download Chromedriver
# ARG CHROMEDRIVER_VERSION="114.0.5735.90"

# RUN wget https://chromedriver.storage.googleapis.com/${CHROMEDRIVER_VERSION}/chromedriver_linux64.zip \
#   && unzip chromedriver_linux64.zip && \
#   rm chromedriver_linux64.zip

# # Install Chromedriver
# RUN mv chromedriver /usr/bin/chromedriver

# # Change Chromedriver permissions
# RUN chown root:root /usr/bin/chromedriver \
#   && chmod +x /usr/bin/chromedriver

# # Set the CHROME_BIN environment variable
# ENV CHROME_BIN=/usr/bin/google-chrome-stable

# Set the working directory
WORKDIR /app

# Coppy the directory contents
COPY . .

# Install all node dependencies
RUN npm install

# Build the app
RUN npm run build

# Runtime stage
# Stage 2: Serve the application with NGINX
FROM nginx:stable-perl as deploy

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
WORKDIR /usr/share/nginx/html

# Copy the build output from the first stage
COPY --from=build /app/dist/frontend .

# Copy Swagger UI files from the sibling directory
COPY --from=build /app/swagger-ui/dist ./swagger

# Copy NGINX configuration
COPY --from=build /app/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/nginx/cors.conf /etc/nginx/conf.d/cors.conf
COPY --from=build /app/nginx/global.conf /etc/nginx/global.conf

# Grant the necessary permissions
RUN chown -R nonroot:nonroot /usr/share/nginx/html && chmod -R 755 /usr/share/nginx/html && \
    chown -R nonroot:nonroot /var/cache/nginx && \
    chown -R nonroot:nonroot /var/log/nginx && \
    chown -R nonroot:nonroot /etc/nginx/conf.d

RUN touch /var/run/nginx.pid && \
    chown -R nonroot:nonroot /var/run/nginx.pid

# Switch to nonroot user
USER nonroot

# Expose port 80
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]