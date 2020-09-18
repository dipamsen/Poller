function setup() {
  noCanvas()
  let showing = 2;
  select("div.link").hide();

  let optionsElt = selectAll(".opt")
  optionsElt.forEach(elt => elt.hide())

  for (let i = 0; i < showing; i++) {
    optionsElt[i].show()
  }

  let plus = select("#add")
  plus.mouseClicked(() => {
    showing++
    for (let i = 0; i < showing; i++) {
      optionsElt[i].show()
    }
    if (showing == 5) plus.hide()
  })

  let submit = select("button")

  submit.mouseClicked(() => {
    //  Submit all values
    let question = select("#ta").value()
    let options = optionsElt.map(_ => _.value()).filter(_ => _)
    if (question && options.length > 1) {
      fetch("/createPoll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question, options })
      }).then(res => res.json())
        .then(body => {
          console.log(body)
          let id = body._id;
          selectAll(".opt").forEach(_ => _.hide());
          select("#ta").hide();
          select("#add").hide();
          select("button").hide();
          select("div.link").show();
          select("#link").html(
            `<a href="${location.href}poll/${id}">${location.href}poll/${id}</a>`
          )
        }).catch(err => console.error(err))
    }
  })
}