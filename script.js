/* globals alert, L, moment */
const ui = (function () { // eslint-disable-line no-unused-vars
  const _maxLines = 30
  const _logLines = []

  let _consoleLogElem = null
  let _progressElem = null

  let _map = null
  let _originMarker = null

  const _mapOptions = {
    center: [17.385044, 78.486671],
    zoom: 20
  }

  const _log = function (message) {
    const date = moment().format('YYYY-MM-DD HH:mm:SS')
    _logLines.push(date + '> ' + message)
    if (_logLines.length > _maxLines) {
      _logLines.shift()
    }
    _consoleLogElem.innerHTML = _logLines.toReversed().join('<br />')
  }

  const _updateMapLocation = function (coordinates) {
    _map.panTo({ lat: coordinates.latitude, lng: coordinates.longitude })
    _originMarker.setLatLng({ lat: coordinates.latitude, lng: coordinates.longitude })
  }

  const _loadMap = function (mapElemId) {
    const map = new L.map(mapElemId, _mapOptions)
    const layer = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    map.addLayer(layer)

    _originMarker = L.circleMarker(_mapOptions.center, {
      color: 'red',
      weight: 5
    })
    _originMarker.addTo(map)
    return map
  }

  const _updateProgress = function (percentage) {
    _progressElem.setAttribute('value', percentage)
  }

  const _mark = function (latitude, longitude, percentage) {
    L.circle({ lat: latitude, lng: longitude }, 7.5, {
      stroke: false,
      fillColor: 'black',
      fillOpacity: 1
    }).addTo(_map)

    L.circle({ lat: latitude, lng: longitude }, 7.5, {
      stroke: false,
      fillColor: '#017fc0',
      fillOpacity: percentage
    }).addTo(_map)

    _originMarker.bringToFront()
  }

  const init = function (mapElemId, consoleElemId, progressElemId, recordElemId) {
    _map = _loadMap(mapElemId)
    _consoleLogElem = document.getElementById(consoleElemId)
    _progressElem = document.getElementById(progressElemId)

    return {
      updateMapLocation: _updateMapLocation,
      updateProgress: _updateProgress,
      mark: _mark,
      log: _log,
      errorHandler: (message) => alert(message)
    }
  }

  return {
    init
  }
})()

const map = (function () { // eslint-disable-line no-unused-vars
  let _ui = null
  let _origin = null

  const _state = {
    alpha: null,
    beta: null,
    gamma: null,
    latitude: null,
    longitude: null
  }

  const _value = function () {
    // 0-1, with a bias on z-axis (compass heading).
    const angleInputs = (
      (Math.sin(_state.alpha * (Math.PI / 180)) + 1) +
      (Math.cos(_state.beta * (Math.PI / 180)) + 1) / 2 +
      (Math.tan(_state.gamma * (Math.PI / 180)) + 1) / 2
    ) / 4.0

    // Pretty much map metres * 2 to degrees.
    const latInput = Math.sin(Math.abs(_state.latitude - _origin.latitude) * 111000.0 * 2 * (Math.PI / 180)) + 1
    const lonInput = Math.cos(Math.abs(_state.longitude - _origin.longitude) * 111000.0 * 2 * (Math.PI / 180)) + 1
    const locationInput = (latInput + lonInput) / 4

    // Offset it with some randomness
    // By multiplying, we cap the output at a certain location.
    return Math.random() * 0.05 + (angleInputs * locationInput * 0.95)
  }

  const _updateState = function (newState) {
    for (const key in newState) {
      _state[key] = newState[key]
    }
    _ui.log('DEBUG: Geo = ' + Object.values(_state).join(','))

    // Capture the first origin to allow mapping distance to value.
    if (_origin === null && _state.latitude !== null && _state.longitude !== null) {
      _origin = {
        latitude: _state.latitude,
        longitude: _state.longitude
      }
      _ui.log('INFO: Established origin!')
    }

    _ui.updateProgress(Math.round(_value() * 100))
  }

  const _significantChange = function (newState, differenceThreshold) {
    for (const key in newState) {
      const oldValue = _state[key]
      if (oldValue === undefined) {
        return true
      }
      const newValue = newState[key]

      // Do we need to handle 0<->360?
      if (Math.abs(newValue - oldValue) > differenceThreshold) {
        return true
      }
    }
  }

  const _newOrientation = function (orientationData) {
    const newState = {
      alpha: Math.round(orientationData.alpha),
      beta: Math.round(orientationData.beta),
      gamma: Math.round(orientationData.gamma)
    }

    if (_significantChange(newState, 5)) {
      _updateState(newState)
    }
  }

  const _newLocation = function (coordinates) {
    const newState = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude
    }

    // 1 degree is roughly 111km (111000m). The below is about 10m.
    if (_significantChange(newState, 0.00009)) {
      _updateState(newState)
    }

    _ui.updateMapLocation(newState)
  }

  const _record = function () {
    const value = _value()
    _ui.log('DEBUG: Raw = ' + value)
    _ui.mark(_state.latitude, _state.longitude, value)
  }

  const _init = function (uiHandlers) {
    _ui = uiHandlers

    _ui.log('INFO: Checking hardware support...')
    if (!window.DeviceOrientationEvent) {
      _ui.error('No device orientation data!')
      return
    }

    if (!navigator.geolocation) {
      _ui.error('No device location data!')
      return
    }

    _ui.log('INFO: Initialised!')
    _ui.log('INFO: Scanning...')
  }

  return {
    init: _init,
    record: _record,
    newOrientation: _newOrientation,
    newLocation: _newLocation
  }
})()
