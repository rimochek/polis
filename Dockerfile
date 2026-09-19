FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate

FROM base AS backend
ENV NODE_ENV=production
CMD ["node", "--import", "tsx", "server/index.ts"]

FROM base AS frontend-build
RUN npm run build

FROM nginx:1.27-alpine AS frontend
COPY deploy/nginx/frontend.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /app/dist /usr/share/nginx/html