## Installation

Install node and npm from [here](https://nodejs.org/en/download/) if you don't have them already. we recommend using the latest LTS version of node. at the time of writing this, that is v16.15.0. if you have node and npm installed, you can check their versions with `node -v`.

**If you face any issues with the latest version, please install the 16.15.0 version of node from [here](https://nodejs.org/download/release/v16.15.0/).**

Follow the steps below to run the project locally:

1. Clone the repository
2. Install packages with `npm install`
3. Change the backend api domain in `src/utility/http/httpConfig.ts` and save the file
4. Run the server with `npm start`
5. Open the browser to `localhost:3000`
6. You can build production files with `npm run build`, please do not forgot to change the backend api domain in `src/utility/http/httpConfig.ts` before building the project
7. Copy the files in the `dist` folder to your server

To run the production build locally, first install serve with `npm install -g serve` and then run `serve -s dist`. This will serve the production build on localhost.
