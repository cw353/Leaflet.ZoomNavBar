/*
* Simple zoom and navigation control that allows changing of zoom levels and back and forward navigation through map's view history.
* Original plugin by David C. (https://github.com/davidchouse/Leaflet.NavBar, MIT license).
* Zoom functionality added by Claire Wagner.
*/

(function() {
  L.Control.ZoomNavBar = L.Control.Zoom.extend({
    options: {
      position: 'topleft',
      //center:,
      //zoom :,
      //bbox:, //Alternative to center/zoom for home button, takes precedence if included
      forwardTitle: 'Go forward in map view history',
      backTitle: 'Go back in map view history',
      homeTitle: 'Go to home map view',
      zoomInTitle: "Zoom in",
      zoomOutTitle: "Zoom out"
    },

    onAdd: function(map) {

      // Set options
      if (!this.options.center) {
        this.options.center = map.getCenter();
      }
      if (!this.options.zoom) {
        this.options.zoom = map.getZoom();
      }
      var options = this.options;

      // Create toolbar
      var controlName = 'leaflet-control-zoomnavbar',
      container = L.DomUtil.create('div', controlName + ' leaflet-bar');
      
      // Add toolbar buttons
      this._zoomInButton = this._createButton("<i class='fa fa-plus'></i>", options.zoomInTitle,controlName + '-zoomin', container, this._zoomIn.bind(this));
      var row = L.DomUtil.create('div', controlName + '-row', container);
      this._backButton = this._createButton("<i class='fa fa-arrow-left'></i>", options.backTitle, controlName + '-back', row, this._goBack);
      this._homeButton = this._createButton("<i class='fa fa-home fa-lg'></i>", options.homeTitle, controlName + '-home', row, this._goHome);
      this._fwdButton = this._createButton("<i class='fa fa-arrow-right'></i>", options.forwardTitle, controlName + '-fwd', row, this._goFwd);
      this._zoomOutButton = this._createButton("<i class='fa fa-minus'></i>", options.zoomOutTitle,controlName + '-zoomout', container, this._zoomOut.bind(this));

      // Initialize view history and index
      this._viewHistory = [{center: this.options.center, zoom: this.options.zoom}];
      this._curIndx = 0;
      this._updateDisabled();
      map.once('moveend', function() {this._map.on('moveend', this._updateHistory, this);}, this);
      // Set intial view to home
      map.setView(options.center, options.zoom);

      return container;
    },

    onRemove: function(map) {
      map.off('moveend', this._updateHistory, this);
    },

    _goHome: function() {
      if (this.options.bbox){
        try {
          this._map.fitBounds(this.options.bbox);
        } catch(err){
          this._map.setView(this.options.center, this.options.zoom); //Use default if invalid bbox input.
        }
      }
      this._map.setView(this.options.center, this.options.zoom);
    },

    _goBack: function() {
      if (this._curIndx !== 0) {
        this._map.off('moveend', this._updateHistory, this);
        this._map.once('moveend', function() {this._map.on('moveend', this._updateHistory, this);}, this);
        this._curIndx--;
        this._updateDisabled();
        var view = this._viewHistory[this._curIndx];
        this._map.setView(view.center, view.zoom);
      }
    },

    _goFwd: function() {
      if (this._curIndx != this._viewHistory.length - 1) {
        this._map.off('moveend', this._updateHistory, this);
        this._map.once('moveend', function() {this._map.on('moveend', this._updateHistory, this);}, this);
        this._curIndx++;
        this._updateDisabled();
        var view = this._viewHistory[this._curIndx];
        this._map.setView(view.center, view.zoom);
      }
    },

    _updateHistory: function() {
      var newView = {center: this._map.getCenter(), zoom: this._map.getZoom()};
      var insertIndx = this._curIndx + 1;
      this._viewHistory.splice(insertIndx, this._viewHistory.length - insertIndx, newView);
      this._curIndx++;
      // Update disabled state of toolbar buttons
      this._updateDisabled();
    },

    _setFwdEnabled: function(enabled) {
      var leafletDisabled = 'leaflet-disabled';
      var fwdDisabled = 'leaflet-control-zoomnavbar-fwd-disabled';
      if (enabled === true) {
        L.DomUtil.removeClass(this._fwdButton, fwdDisabled);
        L.DomUtil.removeClass(this._fwdButton, leafletDisabled);
      }else {
        L.DomUtil.addClass(this._fwdButton, fwdDisabled);
        L.DomUtil.addClass(this._fwdButton, leafletDisabled);
      }
    },

    _setBackEnabled: function(enabled) {
      var leafletDisabled = 'leaflet-disabled';
      var backDisabled = 'leaflet-control-zoomnavbar-back-disabled';
      if (enabled === true) {
        L.DomUtil.removeClass(this._backButton, backDisabled);
        L.DomUtil.removeClass(this._backButton, leafletDisabled);
      }else {
        L.DomUtil.addClass(this._backButton, backDisabled);
        L.DomUtil.addClass(this._backButton, leafletDisabled);
      }
    },

    _updateDisabled: function() {
      L.Control.Zoom.prototype._updateDisabled.call(this); // call parent function
      if (this._curIndx == (this._viewHistory.length - 1)) {
        this._setFwdEnabled(false);
      }else {
        this._setFwdEnabled(true);
      }

      if (this._curIndx <= 0) {
        this._setBackEnabled(false);
      }else {
        this._setBackEnabled(true);
      }
    }

  });

  L.control.zoomNavBar = function(options) {
    return new L.Control.ZoomNavBar(options);
  };

})();
