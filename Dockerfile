FROM node:22-bookworm-slim
WORKDIR /app
COPY tools/ ./tools/
COPY prompts/ ./prompts/
COPY config/ ./config/
COPY samples/sanitized-source-cards.json ./samples/sanitized-source-cards.json
COPY cohort.html ./cohort.html
RUN mkdir -p /app/private-data/cohort-state && chown -R node:node /app
USER node
ENV HOST=0.0.0.0 PORT=8787 COHORT_STATE_DIR=/app/private-data/cohort-state
EXPOSE 8787
CMD ["node", "tools/cohort-server.mjs"]
