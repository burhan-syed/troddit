# Install dependencies only when needed
FROM node:18-alpine AS deps

ENV NODE_ENV=production

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat g++ make py3-pip

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn config set network-timeout 600000 -g
RUN yarn install --frozen-lockfile 

# Rebuild the source code only when needed
FROM node:18-alpine AS builder

ENV NODE_ENV=production

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
ENV NEXT_TELEMETRY_DISABLED 1

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build && yarn install --production --ignore-scripts --prefer-offline

# Production image, copy all the files and run next
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# You only need to copy next.config.js if you are NOT using the default configuration
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
#use standalon/static
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

ARG portnum=3000
EXPOSE ${portnum}
ENV PORT ${portnum}

CMD ["node","server.js"]