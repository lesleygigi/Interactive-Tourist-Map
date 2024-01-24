// config map 
let config = {
  minZoom: 4,
  maxZoom: 18,
  zoomControl:false,
  fullscreenControl:true,
};

// magnification with which the map will start
const zoom = 18;
// co-ordinates
var lat = 31.230519;
var lng = 121.398849;

// calling map
const map = L.map("map", config);
map
  .locate({
    // https://leafletjs.com/reference-1.7.1.html#locate-options-option
    setView: true,
    enableHighAccuracy: true,
  })
  // if location found show marker and circle
  .on("locationfound", (e) => {
    lat=e.latitude,lng=e.longitude;
    map.setView([lat,lng],zoom);
  })

// Used to load and display tile layers on the map
// Most tile servers require attribution, which you can set under `Layer`
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

//reactivate zoom at the desired location
//[topleft, toprigh, bottomleft, bottomright]
L.control.zoom({
  position:"topleft",
}).addTo(map);
L.control.scale({
  imperial:false,
}).addTo(map);

//marker
// for (let i = 0; i < points.length; i++) {
//   const [lat, lng, popupText] = points[i];
//   marker = new L.marker([lat, lng]).bindPopup(popupText).addTo(map);
// }

map.on("click",clickEvent);

function clickEvent(e){
  //obtaining coordinates after clicking on the map
  const markerPlace = document.querySelector(".marker-position");
  markerPlace.textContent=e.latlng;
  
  const marker = new L.marker(e.latlng,{
    draggable: true,
  }).addTo(map).bindPopup(buttonRemove).on("click",clickZoom);

  //event remove marker
  marker.on("popupopen",removeMarker);
  
  //event dragged marker
  marker.on("dragend",dragedMarker);
}

const buttonRemove='<button type="button" class="remove">delete marker 💔</button>';

const markerPlace=document.querySelector(".marker-position");

//remove marker
function removeMarker(){
  const marker=this;
  const btn=document.querySelector(".remove");
  btn.addEventListener("click",function(){
    markerPlace.textContent="goodbye marker 💩";
    map.removeLayer(marker);
  })
}


//draged
function dragedMarker(){
  markerPlace.textContent=`change position: ${this.getLatLng().lat},${this.getLatLng().lng}`;
}

//set center map
function clickZoom(e){
  map.setView(e.target.getLatLng(),zoom);
}

// locating
const locateControl = L.Control.extend({
  // button position
  options: {
    position: "topleft",
    className: "locate-button leaflet-bar",
    html: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>',
    style:
      "margin-top: 50px; left: 0; display: flex; cursor: pointer; justify-content: center; font-size: 2rem;",
  },

  // method
  onAdd: function (map) {
    this._map = map;
    const button = L.DomUtil.create("div");
    L.DomEvent.disableClickPropagation(button);

    button.title = "locate";
    button.innerHTML = this.options.html;
    button.className = this.options.className;
    button.setAttribute("style", this.options.style);

    L.DomEvent.on(button, "click", this._clicked, this);

    return button;
  },
  _clicked: function (e) {
    L.DomEvent.stopPropagation(e);

    // this.removeLocate();

    this._checkLocate();

    return;
  },
  _checkLocate: function () {
    return this._locateMap();
  },

  _locateMap: function () {
    const locateActive = document.querySelector(".locate-button");
    const locate = locateActive.classList.contains("locate-active");
    // add/remove class from locate button
    locateActive.classList[locate ? "remove" : "add"]("locate-active");

    // remove class from button
    // and stop watching location
    if (locate) {
      this.removeLocate();
      this._map.stopLocate();
      return;
    }

    // location on found
    this._map.on("locationfound", this.onLocationFound, this);
    // locataion on error
    this._map.on("locationerror", this.onLocationError, this);

    // start locate
    this._map.locate({ setView: true, enableHighAccuracy: true });
  },
  onLocationFound: function (e) {
    // add circle
    this.addCircle(e).addTo(this.featureGroup()).addTo(map);

    // add marker
    this.addMarker(e).addTo(this.featureGroup()).addTo(map);

    // add legend
  },
  // on location error
  onLocationError: function (e) {
    this.addLegend("Location access denied.");
  },
  // feature group
  featureGroup: function () {
    return new L.FeatureGroup();
  },
  // add legend
  addLegend: function (text) {
    const checkIfDescriotnExist = document.querySelector(".description");

    if (checkIfDescriotnExist) {
      checkIfDescriotnExist.textContent = text;
      return;
    }

    const legend = L.control({ position: "bottomleft" });

    legend.onAdd = function () {
      let div = L.DomUtil.create("div", "description");
      L.DomEvent.disableClickPropagation(div);
      const textInfo = text;
      div.insertAdjacentHTML("beforeend", textInfo);
      return div;
    };
    legend.addTo(this._map);
  },
  addCircle: function ({ accuracy, latitude, longitude }) {
    return L.circle([latitude, longitude], accuracy / 2, {
      className: "circle-test",
      weight: 2,
      stroke: false,
      fillColor: "#136aec",
      fillOpacity: 0.15,
    });
  },
  addMarker: function ({ latitude, longitude }) {
    return L.marker([latitude, longitude], {
      icon: L.divIcon({
        className: "located-animation",
        iconSize: L.point(17, 17),
        popupAnchor: [0, -15],
      }),
    }).bindPopup("Your are here :)");
  },
  removeLocate: function () {
    this._map.eachLayer(function (layer) {
      if (layer instanceof L.Marker) {
        const { icon } = layer.options;
        if (icon?.options.className === "located-animation") {
          map.removeLayer(layer);
        }
      }
      if (layer instanceof L.Circle) {
        if (layer.options.className === "circle-test") {
          map.removeLayer(layer);
        }
      }
    });
  },
});

// adding new button to map controll
map.addControl(new locateControl());

// searching

// add "random" button
const buttonTemplate = `<div class="leaflet-search"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M31.008 27.231l-7.58-6.447c-0.784-0.705-1.622-1.029-2.299-0.998 1.789-2.096 2.87-4.815 2.87-7.787 0-6.627-5.373-12-12-12s-12 5.373-12 12 5.373 12 12 12c2.972 0 5.691-1.081 7.787-2.87-0.031 0.677 0.293 1.515 0.998 2.299l6.447 7.58c1.104 1.226 2.907 1.33 4.007 0.23s0.997-2.903-0.23-4.007zM12 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"></path></svg></div><div class="auto-search-wrapper max-height"><input type="text" id="marker" autocomplete="off"  aria-describedby="instruction" aria-label="Search ..." /><div id="instruction" class="hidden">When autocomplete results are available use up and down arrows to review and enter to select. Touch device users, explore by touch or with swipe gestures.</div></div>`;

// create custom button
const searchControl = L.Control.extend({
  // button position
  options: {
    position: "topleft",
    className: "leaflet-autocomplete",
  },

  // method
  onAdd: function () {
    return this._initialLayout();
  },

  _initialLayout: function () {
    // create button
    const container = L.DomUtil.create(
      "div",
      "leaflet-bar " + this.options.className
    );

    L.DomEvent.disableClickPropagation(container);

    container.innerHTML = buttonTemplate;

    return container;
  },
});

// adding new button to map controll
map.addControl(new searchControl());

// --------------------------------------------------------------

// input element
const root = document.getElementById("marker");

function addClassToParent() {
  const searchBtn = document.querySelector(".leaflet-search");
  searchBtn.addEventListener("click", (e) => {
    // toggle class
    e.target
      .closest(".leaflet-autocomplete")
      .classList.toggle("active-autocomplete");

    // add placeholder
    root.placeholder = "Search ...";

    // focus on input
    root.focus();

    // use destroy method
    autocomplete.destroy();
  });
}

addClassToParent();

// function clear input
map.on("click", () => {
  document
    .querySelector(".leaflet-autocomplete")
    .classList.remove("active-autocomplete");

  clickOnClearButton();
});

// autocomplete section
// more config find in https://github.com/tomickigrzegorz/autocomplete
// --------------------------------------------------------------

const autocomplete = new Autocomplete("marker", {
  delay: 1000,
  selectFirst: true,
  howManyCharacters: 2,

  onSearch: function ({ currentValue }) {
    const api = `https://nominatim.openstreetmap.org/search?format=geojson&limit=5&q=${encodeURI(
      currentValue
    )}`;

    /**
     * Promise
     */
    return new Promise((resolve) => {
      fetch(api)
        .then((response) => response.json())
        .then((data) => {
          resolve(data.features);
        })
        .catch((error) => {
          console.error(error);
        });
    });
  },

  onResults: ({ currentValue, matches, template }) => {
    const regex = new RegExp(currentValue, "i");
    // checking if we have results if we don't
    // take data from the noResults method
    return matches === 0
      ? template
      : matches
          .map((element) => {
            return `
              <li role="option">
                <p>${element.properties.display_name.replace(
                  regex,
                  (str) => `<b>${str}</b>`
                )}</p>
              </li> `;
          })
          .join("");
  },

  onSubmit: ({ object }) => {
    const { display_name } = object.properties;
    const cord = object.geometry.coordinates;
    // custom id for marker
    // const customId = Math.random();

    // remove last marker
    map.eachLayer(function (layer) {
      if (layer.options && layer.options.pane === "markerPane") {
        if (layer._icon.classList.contains("leaflet-marker-locate")) {
          map.removeLayer(layer);
        }
      }
    });

    // add marker
    const marker = L.marker([cord[1], cord[0]], {
      title: display_name,
    });

    // add marker to map
    marker.addTo(map).bindPopup(display_name);

    // set marker to coordinates
    map.setView([cord[1], cord[0]], zoom);

    // add class to marker
    L.DomUtil.addClass(marker._icon, "leaflet-marker-locate");
  },

  // the method presents no results
  noResults: ({ currentValue, template }) =>
    template(`<li>No results found: "${currentValue}"</li>`),
});

var icon=[
  "http://grzegorztomicki.pl/serwisy/pin.png",
  "./icon/religiousSite.png",
  "./icon/waterScenicArea.png",
  "./icon/themePark.png",
  "./icon/historicalSite.png",
  "./icon/architecture.png",
  "./icon/commercialDistrict.png",
  "./icon/mountainSite.png",
  "./icon/exhibitionPark.png",
  "./icon/village.png",
  "./icon/grassland.png",
  "./icon/glacier.png",
  "./icon/desert.png"
]
var funny = L.icon({
  iconUrl: "http://grzegorztomicki.pl/serwisy/pin.png",
  iconSize: [20, 20], // size of the icon
  iconAnchor: [20, 58], // changed marker icon position
  popupAnchor: [0, -60], // changed popup position
});

//五一热门旅游城市
const MayDay=new L.FeatureGroup();
d3.csv("dataset/MayDayHotSpot.csv").then(
  function(data){
    data.forEach(
      function(d){
        const customPopup = `<div class="customPopup">
          <ul class="tabs-example" data-tabs>
            <li><a data-tabby-default href="#sukiennice"></a></li>
          </ul>
          <div id="sukiennice">
            <figure><img src="`+d.imgSrc+`"></figure><div>`+d.description+`</div>
          </div>
        </div>`;
        const customOptions = {
          minWidth: "220", // set max-width
          keepInView: true, // Set it to true if you want to prevent users from panning the popup off of the screen while it is open.
        };
        marker=L.marker([+d.lng,+d.lat],{
          icon:funny,
        })
          .bindPopup(customPopup,customOptions)
          .on("click", runTab)
        MayDay.addLayer(marker);
      }
    )
  },
)
//经典旅游景点
const Classic=new L.FeatureGroup();
//景点分类
const religiousSite=new L.FeatureGroup();
const waterScenicArea=new L.FeatureGroup();
const themePark=new L.FeatureGroup();
const historicalSite=new L.FeatureGroup();
const architecture=new L.FeatureGroup();
const commercialDistrict=new L.FeatureGroup();
const mountainSite=new L.FeatureGroup();
const exhibitionPark=new L.FeatureGroup();
const village=new L.FeatureGroup();
const grassland=new L.FeatureGroup();
const glacier=new L.FeatureGroup();
const desert=new L.FeatureGroup();

d3.json("dataset/Classic.json").then(
  function(data){
    for(var i=0;i<data.length;i++){
      const d=data[i];
      const customPopup = `<div class="customPopup">
      <ul class="tabs-example" data-tabs>
        <li><a data-tabby-default href="#sukiennice"></a></li>
      </ul>
      <div id="sukiennice">
        <div>城市：`+d.city+`<br>景点：`+d.landmark+`<br>评分：`+d.score+`<br>打卡人数：`+d.commentCount+`<br>景点类型：`+d.type+`</div>
      </div>
    </div>`;
    const customOptions = {
      minWidth: "220", // set max-width
      keepInView: true, // Set it to true if you want to prevent users from panning the popup off of the screen while it is open.
    };
    switch(d.type){
      case 'religiousSite':
        var funny = L.icon({
          iconUrl: icon[1],
          iconSize: [25, 25], // size of the icon
          iconAnchor: [20, 58], // changed marker icon position
          popupAnchor: [0, -60], // changed popup position
        });
        marker=L.marker([d.latitude,d.longitude],{
          icon:funny,
        })
          .bindPopup(customPopup,customOptions)
          .on("click", runTab)
        religiousSite.addLayer(marker);
        break;
      case 'waterScenicArea':
        var funny = L.icon({
          iconUrl: icon[2],
          iconSize: [25, 25], // size of the icon
          iconAnchor: [20, 58], // changed marker icon position
          popupAnchor: [0, -60], // changed popup position
        });
        marker=L.marker([d.latitude,d.longitude],{
          icon:funny,
        })
          .bindPopup(customPopup,customOptions)
          .on("click", runTab)
        waterScenicArea.addLayer(marker);
        break;
      case 'themePark':
        var funny = L.icon({
          iconUrl: icon[3],
          iconSize: [25, 25], // size of the icon
          iconAnchor: [20, 58], // changed marker icon position
          popupAnchor: [0, -60], // changed popup position
        });
        marker=L.marker([d.latitude,d.longitude],{
          icon:funny,
        })
          .bindPopup(customPopup,customOptions)
          .on("click", runTab)
        themePark.addLayer(marker);
        break;
      case 'historicalSite':
        var funny = L.icon({
          iconUrl: icon[4],
          iconSize: [25, 25], // size of the icon
          iconAnchor: [20, 58], // changed marker icon position
          popupAnchor: [0, -60], // changed popup position
        });
        marker=L.marker([d.latitude,d.longitude],{
          icon:funny,
        })
          .bindPopup(customPopup,customOptions)
          .on("click", runTab)
        historicalSite.addLayer(marker);
        break;
      case 'architecture':
        var funny = L.icon({
          iconUrl: icon[5],
          iconSize: [25, 25], // size of the icon
          iconAnchor: [20, 58], // changed marker icon position
          popupAnchor: [0, -60], // changed popup position
        });
        marker=L.marker([d.latitude,d.longitude],{
          icon:funny,
        })
          .bindPopup(customPopup,customOptions)
          .on("click", runTab)
        architecture.addLayer(marker);
        break;
      case 'commercialDistrict':
        var funny = L.icon({
          iconUrl: icon[6],
          iconSize: [25, 25], // size of the icon
          iconAnchor: [20, 58], // changed marker icon position
          popupAnchor: [0, -60], // changed popup position
        });
        marker=L.marker([d.latitude,d.longitude],{
          icon:funny,
        })
          .bindPopup(customPopup,customOptions)
          .on("click", runTab)
        commercialDistrict.addLayer(marker);
        break;
      case 'mountainSite':
        var funny = L.icon({
          iconUrl: icon[7],
          iconSize: [25, 25], // size of the icon
          iconAnchor: [20, 58], // changed marker icon position
          popupAnchor: [0, -60], // changed popup position
        });
        marker=L.marker([d.latitude,d.longitude],{
          icon:funny,
        })
          .bindPopup(customPopup,customOptions)
          .on("click", runTab)
        mountainSite.addLayer(marker);
        break;
      case 'exhibitionPark':
        var funny = L.icon({
          iconUrl: icon[8],
          iconSize: [25, 25], // size of the icon
          iconAnchor: [20, 58], // changed marker icon position
          popupAnchor: [0, -60], // changed popup position
        });
        marker=L.marker([d.latitude,d.longitude],{
          icon:funny,
        })
          .bindPopup(customPopup,customOptions)
          .on("click", runTab)
        exhibitionPark.addLayer(marker);
        break;
      case 'village':
        var funny = L.icon({
          iconUrl: icon[9],
          iconSize: [25, 25], // size of the icon
          iconAnchor: [20, 58], // changed marker icon position
          popupAnchor: [0, -60], // changed popup position
        });
        marker=L.marker([d.latitude,d.longitude],{
          icon:funny,
        })
          .bindPopup(customPopup,customOptions)
          .on("click", runTab)
        village.addLayer(marker);
        break;
      case 'grassland':
        var funny = L.icon({
          iconUrl: icon[10],
          iconSize: [25, 25], // size of the icon
          iconAnchor: [20, 58], // changed marker icon position
          popupAnchor: [0, -60], // changed popup position
        });
        marker=L.marker([d.latitude,d.longitude],{
          icon:funny,
        })
          .bindPopup(customPopup,customOptions)
          .on("click", runTab)
        grassland.addLayer(marker);
        break;
      case 'glacier':
        var funny = L.icon({
          iconUrl: icon[11],
          iconSize: [25, 25], // size of the icon
          iconAnchor: [20, 58], // changed marker icon position
          popupAnchor: [0, -60], // changed popup position
        });
        marker=L.marker([d.latitude,d.longitude],{
          icon:funny,
        })
          .bindPopup(customPopup,customOptions)
          .on("click", runTab)
        glacier.addLayer(marker);
        break;
      case 'desert':
        var funny = L.icon({
          iconUrl: icon[12],
          iconSize: [20, 20], // size of the icon
          iconAnchor: [20, 58], // changed marker icon position
          popupAnchor: [0, -60], // changed popup position
        });
        marker=L.marker([d.latitude,d.longitude],{
          icon:funny,
        })
          .bindPopup(customPopup,customOptions)
          .on("click", runTab)
        desert.addLayer(marker);
        break;
    }
    Classic.addLayer(marker);
    }
  }
)

// center map when click on marker
function runTab() {
  //const tabs = new Tabby("[data-tabs]");
}


const overlayMaps = {
  "五一热门景点": MayDay,
  "经典旅游景点": Classic,
  "宝刹妙境": religiousSite,
  "水天一色": waterScenicArea,
  "欢乐洋溢": themePark,
  "名胜古迹": historicalSite,
  "宏伟壮观": architecture,
  "熙熙攘攘": commercialDistrict,
  "云深雾绕": mountainSite,
  "异彩纷呈": exhibitionPark,
  "田园风光": village,
  "广袤辽阔": grassland,
  "雪域高山": glacier,
  "沙海奇观": desert,
};

// // centering a group of markers
// map.on("layeradd layerremove", function () {
//   // Create new empty bounds
//   let bounds = new L.LatLngBounds();
//   // Iterate the map's layers
//   map.eachLayer(function (layer) {
//     // Check if layer is a featuregroup
//     if (layer instanceof L.FeatureGroup) {
//       // Extend bounds with group's bounds
//       bounds.extend(layer.getBounds());
//     }
//   });

//   // Check if bounds are valid (could be empty)
//   if (bounds.isValid()) {
//     // Valid, fit bounds
//     map.flyToBounds(bounds);
//   } else {
//     // Invalid, fit world
//     // map.fitWorld();
//   }
// });

L.Control.CustomButtons = L.Control.Layers.extend({
  onAdd: function () {
    this._initLayout();
    this._update();
    return this._container;
  },
  createButton: function (type, className) {
    const elements = this._container.getElementsByClassName(
      "leaflet-control-layers-list"
    );
    const button = L.DomUtil.create(
      "button",
      `btn-markers ${className}`,
      elements[0]
    );
    button.textContent = `${type} markers`;

    L.DomEvent.on(button, "click", function (e) {
      const checkbox = document.querySelectorAll(
        ".leaflet-control-layers-overlays input[type=checkbox]"
      );

      // Remove/add all layer from map when click on button
      [].slice.call(checkbox).map((el) => {
        el.checked = type === "add" ? false : true;
        el.click();
      });
    });
  },
});

new L.Control.CustomButtons(null, overlayMaps, { collapsed: false }).addTo(map);

function afterRender(result) {
  return result;
}

function afterExport(result) {
  return result;
}
function downloadMap(caption) {
  var downloadOptions = {
    container: map._container,
    caption: {
      text: caption,
      font: '30px Arial',
      fillStyle: 'black',
      position: [100, 200]
    },
    exclude: [],
    format: 'image/png',
    fileName: 'Map.png',
    afterRender: afterRender,
    afterExport: afterExport
  };
  var promise = map.downloadExport(downloadOptions);
  var data = promise.then(function (result) {
    return result;
  });
}



// exporting
const exportControl = L.Control.extend({
  // button position
  options: {
    position: "topleft",
    className: "export-button leaflet-bar",
    html: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5 5-5-5M12 12.8V2.5"/></svg>',
    style:
      "margin-top: 60px; left: 0; display: flex; cursor: pointer; justify-content: center; font-size: 2rem;",
  },
  // method
  onAdd: function (map) {
    this._map = map;
    const button = L.DomUtil.create("div");
    L.DomEvent.disableClickPropagation(button);

    button.title = "export";
    button.innerHTML = this.options.html;
    button.className = this.options.className;
    button.setAttribute("style", this.options.style);

    L.DomEvent.on(button, "click", this._clicked, this);

    return button;
  },
  _clicked: function () {
    downloadMap()
    return;
  },
});
map.addControl(new exportControl());
