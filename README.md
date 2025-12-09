# safeguarding-module-quiz-backend

### Start Backend Server with Node.js

```shell
node /api/send-email.js
```

### Start Backend Server with Nodemon

```shell
npm run dev
```

### Vercel setup

* /api folder contains the assets and the Vercel server file
* express, app.listen() are removed as Vercel is not supporting servers, but functions only
* Exported functions, because Vercel supports serverless format only
* Method check is add - triggered on POST only
* Replaced static asset and body parser middleware - not neede for serverless setup
* Moved all logic inside a function - requirement for serverless setup