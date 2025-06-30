
FROM node:18

WORKDIR /app

COPY package*.json ./
# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose the application port (3000 by default)
EXPOSE 3000

#Run the application
CMD ["npm", "run", "start"]
