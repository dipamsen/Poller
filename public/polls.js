function setup() {
  noCanvas();
  let id = location.href.split('/').pop()
  fetch(`/_poll/${id}`).then(res => res.json()).then(doc => {
    let { question, options } = doc;
    select("button").mousePressed(() => { handlePress(selector, id) })
    createP(question).parent(select(".content"))
    let selector = createOptionsSelector(options);
  }).catch(err => console.error(err))
}

function createOptionsSelector(op) {
  let a = createRadio();
  for (let o in op) a.option(o, op[o]);
  a.parent(select(".content"))
  return a;
}

function handlePress(radio, pollID) {
  // Radio Buttons
  let selected = int(radio.value())
  if (!isNaN(selected)) {
    fetch(`/pollEntries/${pollID}`, {
      method: "POST",
      body: JSON.stringify({ pollID, selected }),
      headers: {
        "Content-Type": "application/json"
      }
    }).then(res => res.json()).then(doc => {
      console.log(doc);
      alert("Your selection has been submitted.")
      location.replace("/")
    })
  }

}