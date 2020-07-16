const categories = [
  'puts',
  'ice-box',
  'in-progress',
  'emergency',
  'testing',
  'finished'
]
function openForm () {
  document.getElementById('addForm').style.display = 'block'
}

function closeForm () {
  document.getElementById('addForm').style.display = 'none'
}

function allowDrop (ev) {
  ev.preventDefault()
}

function drag (ev) {
  ev.dataTransfer.setData('text', ev.target.id)
}

function drop (ev) {
  ev.preventDefault()
  // BUG HERE, Fixed
  var data = ev.dataTransfer.getData('text')
  ev.target.appendChild(document.getElementById(data))
}

function addTask (form) {
  const task = form.elements['task'].value
  const description = form.elements['description'].value
  const status = form.elements['status'].value
  const container = document.getElementsByClassName(status)[0]
  const childDiv = container.getElementsByTagName('div')[0]
  const div = document.createElement('div')
  div.innerHTML =
    `<div class="card" draggable="true" id="` +
    task +
    Math.random() +
    `" ondragstart="drag(event)">
            <h1 class="content-title">${task}</h1>
            <p class="content-body">${description}</p>
          </div>`
  childDiv.appendChild(div)
  const Http = new XMLHttpRequest()
  const url = window.location.href + '/create'
  const data = {
    title: task,
    description: description,
    progress: categories.indexOf(status)
  }
  Http.open('POST', url)
  Http.send(data)

  Http.onreadystatechange = e => {
    console.log(Http.responseText)
  }
}

let addListeners = () => {
  let form = document.forms[0]
  form.addEventListener('submit', event => {
    event.preventDefault()
    addTask(form)
  })
}
