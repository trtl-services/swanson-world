document.addEventListener('DOMContentLoaded', () => {
  // Navbar

  const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0)

  if ($navbarBurgers.length > 0) {
    $navbarBurgers.forEach(el => {
      el.addEventListener('click', () => {
        const target = el.dataset.target
        const $target = document.getElementById(target)

        el.classList.toggle('is-active')
        $target.classList.toggle('is-active')
      })
    })
  }


  // Modals

  var rootEl = document.documentElement
  var $modals = getAll('.modal')
  var $modalButtons = getAll('.modal-button')
  var $modalCloses = getAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button')

  if ($modalButtons.length > 0) {
    $modalButtons.forEach(function($el) {
      $el.addEventListener('click', function() {
        var target = $el.dataset.target
        var $target = document.getElementById(target)

        rootEl.classList.add('is-clipped')
        $target.classList.add('is-active')
      })
    })
  }

  if ($modalCloses.length > 0) {
    $modalCloses.forEach(function($el) {
      $el.addEventListener('click', function() {
        closeModals()
      })
    })
  }

  document.addEventListener('keydown', function(event) {
    var e = event || window.event
    if (e.keyCode === 27) {
      closeModals()
    }
  })

  function closeModals() {
    rootEl.classList.remove('is-clipped')
    $modals.forEach(function($el) {
      $el.classList.remove('is-active')
    })
  }

  //Activity Modal

  var $activityModals = getAll('.modal-activity')
  var activityTarget = document.getElementById('activityData')
  var activityMessage = document.getElementById('activityMessage')

  if ($activityModals.length > 0) {
    $activityModals.forEach(function($el) {
      $el.addEventListener('click', function() {
        var id = this.getAttribute('data-id')
        var message = this.getAttribute('data-message')

        if (message) {
          activityMessage.innerHTML += '<b>Message: </b>' + message
        }

        fetch('/activity/' + id, {
          method: 'get'
        })
        .then((resp) => resp.json())
        .then(function(data) {
          Object.keys(data).forEach(function(k) {
            activityTarget.innerHTML += '<b>' + k + ':</b> ' + data[k] + '<br /><br />'
          })
        }).catch(function(err) {
          console.log(err)
        })
      })
    })
    const mutationObserver = new MutationObserver(function(mutations) {
      activityTarget.innerHTML = '', activityMessage.textContent = ''
    })
    mutationObserver.observe(document.getElementById('viewActivity'), {
      attributes: true
    })

  }


  //Alert Modal

  var $alertModals = getAll('.modal-alert')
  var alertTarget = document.getElementById('alertData')
  var alertMessage = document.getElementById('alertMessage')

  if ($alertModals.length > 0) {
    $alertModals.forEach(function($el) {

      $el.addEventListener('click', function() {
        var id = this.getAttribute('data-id')
        var message = this.getAttribute('data-message')
        if (message) {
          alertMessage.innerHTML += '<b>Message: </b>' + message
        }

        fetch('/alerts/' + id, {
          method: 'get'
        })
        .then((resp) => resp.json())
        .then(function(data) {
          Object.keys(data).forEach(function(k) {
            alertTarget.innerHTML += '<b>' + k + ':</b> ' + data[k] + '<br /><br />'
          })

        }).catch(function(err) {
          console.log(err)
        })
      })
    })

    const mutationObserver = new MutationObserver(function(mutations) {
      alertTarget.innerHTML = '', alertMessage.textContent = ''
    })
    mutationObserver.observe(document.getElementById('viewAlert'), {
      attributes: true
    })
  }


  //Webhook Modal

  var $webhookModals = getAll('.modal-webhook')
  var webhookTarget = document.getElementById('webhookData')
  var webhookMessage = document.getElementById('webhookMessage')

  if ($webhookModals.length > 0) {
    $webhookModals.forEach(function($el) {

      $el.addEventListener('click', function() {
        var id = this.getAttribute('data-id')
        var message = this.getAttribute('data-message')
        if (message) {
          alertMessage.innerHTML += '<b>Message: </b>' + message
        }

        fetch('/webhooks/' + id, {
          method: 'get'
        })
        .then((resp) => resp.json())
        .then(function(data) {
          Object.keys(data).forEach(function(k) {
            webhookTarget.innerHTML += '<b>' + k + ':</b> ' + data[k] + '<br /><br />'
          })

        }).catch(function(err) {
          console.log(err)
        })
      })
    })

    const mutationObserver = new MutationObserver(function(mutations) {
      webhookTarget.innerHTML = '', webhookMessage.textContent = ''
    })
    mutationObserver.observe(document.getElementById('viewWebhook'), {
      attributes: true
    })
  }
  
  // Functions

  function getAll(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector), 0)
  }
})

function show(id) {
  document.getElementById(id).style.visibility = 'visible'
}

function hide(id) {
  document.getElementById(id).style.visibility = 'hidden'
}

function dismiss(d) {
  d.parentNode.style.display = 'none'
}

// App Dashboard
function verifyAppName(name) {
  if (document.getElementById('verifyApp').value === name) {
    document.getElementById('deleteAppButton').disabled = false
  } else {
    document.getElementById('deleteAppButton').disabled = true
  }
}


// Wallet Dashboard
function verifyWalletName(name) {
  if (document.getElementById('verifyWallet').value === name) {
    document.getElementById('deleteWalletButton').disabled = false
  } else {
    document.getElementById('deleteWalletButton').disabled = true
  }
}

// App Tokens
function verifyTokenName(name) {
  if (document.getElementById('verifyToken').value === name) {
    document.getElementById('deleteTokenButton').disabled = false
  } else {
    document.getElementById('deleteTokenButton').disabled = true
  }
}

function deleteToken(d) {
  const id = d.getAttribute('data-id')
  const name = d.getAttribute('data-name')

  document.getElementById('tokenId').value = id
  document.getElementById('tokenName').textContent = name

  document.getElementById('verifyToken').onchange = function() {
    verifyTokenName(name)
  }
}

// App Webhooks

function verifyWebhookName(name) {
  if (document.getElementById('verifyWebhook').value === name) {
    document.getElementById('deleteWebhookButton').disabled = false
  } else {
    document.getElementById('deleteWebhookButton').disabled = true
  }
}

function deleteWebhook(d) {
  const id = d.getAttribute('data-id')
  const name = d.getAttribute('data-name')

  document.getElementById('webhookId').value = id
  document.getElementById('webhookName').textContent = name

  document.getElementById('verifyWebhook').onchange = function() {
    verifyWebhookName(name)
  }
}
