import { Component, ViewChild, ElementRef, ViewEncapsulation } from "@angular/core";
import leaflet from "leaflet";
import * as $ from "jquery";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
  encapsulation: ViewEncapsulation.None
})
export class HomePage {
  @ViewChild("map") mapContainer: ElementRef;
  map: any;

  ionViewDidEnter() {
    this.loadmap();
  }

  loadmap() {
    this.map = leaflet.map("map", {
      center: [-6.16, 106.85],
      zoom: 10,
      scrollWheelZoom: false
    });

    leaflet
      .tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", {
        attribution:
          // tslint:disable-next-line: max-line-length
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
      })
      .addTo(this.map);

    $.ajaxSetup({
      async: false
    });

    const result = $.getJSON("../../assets/keca.geojson", function(data) {})
      .responseJSON;
    console.log(result.features[42].properties.text_count);
    // leaflet.geoJson(result).addTo(this.map);
    leaflet.geoJson(result, {style: style}).addTo(this.map);


    // Get max text_count
    function getMax(textcount) {
    let max = null;
    for (let index = 0; index < textcount.length; index++) {
        const tc = Number(textcount[index].properties.text_count);
        if (tc > max) {
          max = tc;
        }
      }
      console.log("max value =" + max);
      return max;
    }
  
    function getColor(params: any) {
      const max = getMax(result.features);
      return params > max ? '#800026' :
             params > max * 0.8 ? '#BD0026' :
             params > max * 0.6 ? '#E31A1C' :
             params > max * 0.4 ? '#FC4E2A' :
             params > max * 0.2 ? '#FD8D3C' :
                                  '#FEB24C' ;
    }

    function style(result) {
      return {
        fillColor: getColor(result.properties.text_count),
        weight: 1,
        opacity: 1,
        color: 'black',
        fillOpacity: 0.7
      };
    }

    // Creates an info box on the map
    const info = leaflet.control();
    info.onAdd = function (map) {
      this._div = leaflet.DomUtil.create('div', 'info');
      this.update();
      return this._div;
    };

    // Edit grades in legend to match the ranges cutoffs inserted above
    // In this example, the last grade will appear as 5000+
    const legend = leaflet.control({ position: 'bottomright' });
    legend.onAdd = function (map) {
      const max = getMax(result.features);
      let div = leaflet.DomUtil.create('div', 'info legend'),
        grades = [0, Math.round(max * 0.2), Math.round(max * 0.4), Math.round(max * 0.6), Math.round(max * 0.8), max],
        labels = [],
        from, to;
      for (let i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];
        labels.push(
          '<i style="background:' + getColor(from + 1) + '"></i> ' +
          from + (to ? '&ndash;' + to : ''));
      }
      div.innerHTML = labels.join('<br>');
      return div;
    };
    legend.addTo(this.map);

    // test marker
    leaflet
      .marker([-6.16, 106.85])
      .addTo(this.map)
      .bindPopup("A pretty CSS3 popup.<br> Easily customizable.")
      .openPopup();
  }
}
