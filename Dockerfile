
FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the application port (3000 by default)
EXPOSE 3000

#Run the application
CMD ["node", "src/app.ts"]
