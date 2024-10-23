# About

This is the backend for a expenses sharing application.

The tech stack used is:
- NodeJS
- MongoDB
- Zod (For input validation

Features:
- Authentication
- Input validation
- Add 3 types of expenses (Exact, Percentage, Equal}
- Get individual expenses and overall expenses
- Get Balance sheet

## Project Setup Steps

1. Clone the repo locally. Then in the root of the folder where package.json lies, run the following commands.

```bash
npm install
```

This will install all necessary dependencies needed to run the project locally.

2. Then create a .env file in the root of the folder. Add the following keys in the file.

```
PORT = 3000
MONGO_URL = mongodb+srv://123:123@cluster0.tdck5rv.mongodb.net/convin4
JWT_SECRET = holaamigo
```
## Start the App 
In the VS code terminal, run the command : ```npm run dev``` to start the project. If everything is set up properly, then the app will start and you will see this in the console. 

```
[nodemon] starting `node index.js`
Server is listening on port 3000
Database connected successfully !
```



## API endpoints

Go to the given URL to access the API documentation.
```
https://documenter.getpostman.com/view/17849933/2sAY4rDjUY
```

