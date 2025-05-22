FROM node:22
WORKDIR /usr/src/app
ENV PORT 80
COPY . ./

# BUILDING THE APP
# INSTALL pnpm
RUN npm install -g pnpm
# INSTALL DEPENDENCIES
RUN pnpm install
# BUILD THE APP
RUN pnpm build
# EXPOSE PORT
EXPOSE 80

# RUNNING THE APP
CMD ["pnpm", "start"] 