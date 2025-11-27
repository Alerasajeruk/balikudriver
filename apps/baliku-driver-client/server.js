const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = 3001;
app.listen(port, () => {
  console.log(`Baliku Driver PWA running on http://localhost:${port}`);
});
