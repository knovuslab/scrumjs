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
  let card = document.getElementById(data)
  ev.target.appendChild(card)
  post(
    '/update_progress',
    `progress=${ev.target.dataset.progress}&id=${data}`,
    res => {}
  )
}

function addTask (form) {
  post(
    '/create',
    `title=${task}&description=${description}&progress=${categories.indexOf(
      status
    )}`,
    function (res) {
      const task = form.elements['task'].value
      const description = form.elements['description'].value
      const status = form.elements['status'].value
      const container = document.getElementsByClassName(status)[0]
      const childDiv = container.getElementsByTagName('div')[0]
      const div = document.createElement('div')
      div.innerHTML =
        `<div class="card" draggable="true" id="` +
        res.data.id +
        `" ondragstart="drag(event)">
            <h1 class="content-title">${task}</h1>
            <p class="content-body">${description}</p>
          </div>`
      childDiv.appendChild(div)
    }
  )
}

function post (url, data, callback) {
  showLoading()
  const Http = new XMLHttpRequest()
  Http.open('POST', window.location.href + url)
  Http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
  Http.send(data)
  Http.onreadystatechange = e => {
    if (Http.readyState) hideLoading()
    if (Http.readyState == 4 && Http.status == 200) {
      console.log(Http.responseText)
      let response = JSON.parse(Http.responseText)
      callback(response)
    }
  }
}
let addListeners = () => {
  let form = document.forms[0]
  form.addEventListener('submit', event => {
    event.preventDefault()
    addTask(form)
  })
}

function showLoading () {
  document.querySelector('.loading').style.display = 'block'
}
function hideLoading () {
  document.querySelector('.loading').style.display = 'none'
}

function displayCards () {
  post('/cards', (data = ''), datas => {
    datas.data.forEach(data => {
      const task = data.title
      const description = data.description
      const status = categories[data.progress]
      const container = document.getElementsByClassName(status)[0]
      const childDiv = container.getElementsByTagName('div')[0]
      const div = document.createElement('div')
      div.innerHTML =
        `<div class="card" draggable="true" id="` +
        data.id +
        `" ondragstart="drag(event)">
                  <h1 class="content-title">${task}</h1>
                  <p class="content-body">${description}</p>
                  <i><em><small>${data.user_name}</small></em></i></br>
                  <small><code>${data.modified_date}</code></small>
                </div>`
      childDiv.appendChild(div)
    })
  })
}
function getUser () {
  post('/user', (data = ''), data => {
    document.getElementById('username').innerText = data.data.username
  })
}
