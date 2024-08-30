# BibleBot

A Retrieval Only Chatbot (ROC) that responds with verses from the bible.  
It is basically a RAG app without the generation part.  
The app runs entirely in the browser (without the need for a backend).  

The app is build using:

- reactJs
- tensorflow.js
- universal-sentence-encoder 
- vite
- tailwindcss
- parquetjs
- hyparquet
- react-icons
- react-spinners

# Demo

Try out the app at https://biblebot.audaxland.net/

# Usage

To install:

- Pull the repository from GitHub
```bash
git clone https://github.com/audaxland/biblebot.git
```

- Install packages:
```bash
cd biblebot
npm install
```

- Build the data file bible.parquet:
  This file contains the entire data including the vectors 
  and the vector tree structure that used to search the best responses for a query.  
  The file is a static file of about 70Mo, and only needs to be generated once.  
  Once this file is generate, no backend server is needed to serve the app,
  and it can be delivered via a cdn or any static web server.  
  This operation can take a while, it takes about 20 minutes on a i7 cpu.  
  The script runs using the tfjs-node library, which is much faster than the bare tfjs library, 
  however it can be challenging to get working on some environments. 
```bash
npm run data
```

- Run the app in dev mode
```bash
npm run dev
```

- Check the dev app via your browser at http://localhost:5173/

- Run for prod mode
```bash
npm run build
npm run preview
```

- Check the prod app via your browser at http://localhost:4173/

# Screenshot

![BibleBot Screenshot](biblebot-screenshot.jpg)