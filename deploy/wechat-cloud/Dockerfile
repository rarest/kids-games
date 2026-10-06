# Preparation template: API only. Build from the repository root.
# This does not include PostgreSQL, static HTTP hosting, or the Python scorer.
FROM node:24-bookworm-slim
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8080
WORKDIR /app/platform
COPY platform/package.json platform/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY --chown=node:node platform/*.mjs ./
COPY --chown=node:node platform/migrations ./migrations
WORKDIR /app
COPY --chown=node:node package.json ./
COPY --chown=node:node english/core.js english/course-engine.js english/course-curriculum.js english/curriculum.js english/page-practice.js ./english/
COPY --chown=node:node english/textbook-photo-*.json english/content-g*.json ./english/
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 CMD node -e "fetch('http://127.0.0.1:8080/api/health',{signal:AbortSignal.timeout(4000)}).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "platform/server.mjs"]
