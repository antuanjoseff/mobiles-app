export class Track {
  constructor() {
    this.coords = [];
    this.geojson = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [],
      },
    };
  }

  addCoords(location) {
    this.geojson.geometry.coordinates.push([
      location.longitude,
      location.latitude,
    ]);
    if (this.geojson.geometry.coordinates.length == 1) {
      this.geojson.geometry.coordinates.push([
        location.longitude,
        location.latitude,
      ]);
    }
  }
}
