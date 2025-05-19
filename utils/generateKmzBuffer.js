const tokml = require("tokml");
const AdmZip = require("adm-zip");

function haversineDistance(coord1, coord2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371e3;
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);
  const lat1 = toRad(coord1.latitude);
  const lat2 = toRad(coord2.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getShortestPath(waypoints) {
  const remaining = [...waypoints];
  const path = [];
  let current = remaining.shift();
  path.push(current);

  while (remaining.length > 0) {
    let nearestIndex = 0;
    let nearestDist = haversineDistance(current, remaining[0]);

    for (let i = 1; i < remaining.length; i++) {
      const dist = haversineDistance(current, remaining[i]);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIndex = i;
      }
    }

    current = remaining.splice(nearestIndex, 1)[0];
    path.push(current);
  }

  return path;
}

function generateKmzBuffer(waypoints) {
  const sortedWaypoints = getShortestPath(waypoints);

  const geojson = {
    type: "FeatureCollection",
    features: [
      ...sortedWaypoints.map((wp) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [wp.longitude, wp.latitude],
        },
        properties: {
          name: wp.name,
          description: wp.description || "",
        },
      })),
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: sortedWaypoints.map((wp) => [wp.longitude, wp.latitude]),
        },
        properties: {
          name: "Shortest Path",
        },
      },
    ],
  };

  const kml = tokml(geojson, {
    documentName: "Employee Waypoints Path",
    documentDescription: "Shortest distance-based path",
  });

  const zip = new AdmZip();
  zip.addFile("doc.kml", Buffer.from(kml, "utf-8"));
  return zip.toBuffer();
}

module.exports = generateKmzBuffer;
