function centerMap(map, longitude, latitude) {
  map.value.setCenter([longitude, latitude]);
}

function setDataLocation(longitude, latitude) {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [longitude, latitude],
    },
  };
}

export { centerMap, setDataLocation };
