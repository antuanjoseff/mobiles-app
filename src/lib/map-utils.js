function centerMap(map, coords) {
  map.value.setCenter([coords.longitude, coords.latitude]);
}

function setDataLocation({ longitude, latitude }) {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [longitude, latitude],
    },
  };
}

export { centerMap, setDataLocation };
