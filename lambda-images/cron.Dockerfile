# Define custom function directory
ARG FUNCTION_DIR="/function"

FROM node:20-bullseye as build-image

# Include global arg in this stage of the build
ARG FUNCTION_DIR

WORKDIR ${FUNCTION_DIR}

# Install build dependencies
RUN apt update -qq && \
    apt install -y --no-install-recommends \
    g++ \
    make \
    cmake \
    unzip \
    libcurl4-openssl-dev \
    && mkdir -p ${FUNCTION_DIR}

# Copy function code
COPY . ${FUNCTION_DIR}


# Install Node.js dependencies
# Install the runtime interface client
RUN npm ci \
  && npm install aws-lambda-ric \
  && npm run build:cron


# Grab a fresh slim copy of the image to reduce the final size
FROM node:20-bullseye-slim

# Required for Node runtimes which use npm@8.6.0+ because
# by default npm writes logs under /home/.npm and Lambda fs is read-only
ENV NPM_CONFIG_CACHE=/tmp/.npm

# Include global arg in this stage of the build
ARG FUNCTION_DIR

# Set working directory to function root directory
WORKDIR ${FUNCTION_DIR}

ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8

# Copy in the built dependencies
COPY --from=build-image ${FUNCTION_DIR} ${FUNCTION_DIR}

RUN apt update -qq \
  && apt install -y --no-install-recommends ffmpeg \
  && mv dist/* .

# Set runtime interface client as default command for the container runtime
ENTRYPOINT ["/usr/local/bin/npx", "aws-lambda-ric"]
# Pass the name of the function handler as an argument to the runtime
CMD ["index.handler"]
