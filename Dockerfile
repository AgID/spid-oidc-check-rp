FROM node:14-bullseye-slim 

# Metadata params
ARG BUILD_DATE
ARG VCS_REF
ARG VCS_URL
ARG VERSION
ARG EXPOSE_HTTPS_PORT

# Define the Metadata Container image
# For more info refere to https://github.com/opencontainers/image-spec/blob/main/annotations.md
LABEL   org.opencontainers.image.authors="Michele D'Amico, michele.damico@agid.gov.it" \
        org.opencontainers.image.created=${BUILD_DATE} \
        org.opencontainers.image.version=${VERSION} \
        org.opencontainers.image.source=${VCS_URL} \
        org.opencontainers.image.revision=${VCS_REF} \
        org.opencontainers.image.url="https://github.com/AgID/spid-oidc-check-rp" \
        org.opencontainers.image.vendor="AgID" \
        org.opencontainers.image.licenses="EUPL-1.2" \
        org.opencontainers.image.title="SPID OIDC CHECK RP" \
        org.opencontainers.image.description="SPID OIDC Conformance Test Tool for Relying Party" \
        org.opencontainers.image.base.name="AgID/spid-oidc-check-rp"

# Update and install utilities
RUN apt-get update && apt-get install -y \
        wget \
        curl \
        unzip \
        openssl \
        python3 \
        build-essential
        
# Set the working directory
WORKDIR /spid-oidc-check-rp

# Copy the current directory to /spid-oidc-check-rp
ADD . /spid-oidc-check-rp

# Copy configurations
RUN cp -R /spid-oidc-check-rp/src/config_sample /spid-oidc-check-rp/src/config

# Create directory for tests data
RUN mkdir /spid-oidc-check-rp/src/data

ENV TZ=Europe/Rome
ENV NODE_HTTPS_PORT=${EXPOSE_HTTPS_PORT}

# Build validator
RUN cd /spid-oidc-check-rp/src && \
    cd client && npm install --silent && npm run build && cd .. && \
    cd server && npm install && cd ..

# Ports exposed
EXPOSE ${EXPOSE_HTTPS_PORT}


ENTRYPOINT cd src && node server/spid-oidc-check-rp
