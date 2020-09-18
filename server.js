const express = require('express');
const Datastore = require('nedb');
const __id__ = require('unique-string')
const app = express();
const PORT = process.env.port || 8080

app.listen(PORT, () => console.log(`listening at ${PORT}`));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

const db = {}
db.polls = new Datastore('polls.db');
db.polls.loadDatabase();
db.entries = new Datastore('entries.db');
db.entries.loadDatabase();

// GET - Poll Stats of :pollID
app.get("/pollEntries/:pollID", (req, res) => {
  const { pollID } = req.params;
  db.entries.find({ pollID }, (err, allEntries) => {
    db.polls.find({ _id: pollID }, (errr, docs) => {
      let pollData = docs[0]
      let entryCount = {}
      for (let i = 0; i < pollData.options.length; i++) {
        entryCount[pollData.options[i]] = allEntries.filter(c => c.selected == i).length
      }
      res.json({ pollID, entryCount, allEntries, pollData })
    })
  })
})

// GET - All Poll data
app.get("/polls", (req, res) => {
  db.polls.find({}, (err, docs) => {
    if (err) console.error(err)
    res.json(docs.map(a => ({ ...a, voteLink: `${req.protocol + '://' + req.get('host')}/poll/${a._id}`, statsLink: `${req.protocol + '://' + req.get('host')}/pollEntries/${a._id}` })))
  })
})

// POST - New Poll Entry
app.post("/pollEntries/:pollID", (req, res) => {
  const { pollID } = req.params;
  const { selected } = req.body;
  const entry = { pollID, selected };
  db.entries.insert(entry, (err, doc) => {
    if (err) return console.error(err);
    res.json(doc);
  })
})

// GET - Poll Vote Link
app.get("/poll/:pollID", (req, res) => {
  let id = req.params.pollID
  db.polls.find({ _id: id }, (err, docs) => {
    if (docs.length > 0)
      res.sendFile(__dirname + '/public/poll.html')
    else res.status(404).sendFile(__dirname + '/public/404.html')
  })
})

// GET - Poll Data
app.get("/_poll/:pollID", (req, res) => {
  db.polls.find({ _id: req.params.pollID }, (err, docs) => {
    if (docs.length > 0)
      res.json(docs[0])
    else res.status(404).json({ error: "not found" })
  })
})

// POST - New Poll
app.post("/createPoll", (req, res) => {
  const poll = {
    question: req.body.question,
    options: req.body.options
  }
  db.polls.insert(poll, (err, doc) => {
    if (err) return console.error(err)
    res.json(doc)
  })
})

// GET - New Poll
app.get("/createPoll", (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})