const tokml = require("tokml");
const AdmZip = require("adm-zip");

// Improved haversine distance calculation
function haversineDistance(coord1, coord2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Improved path finding algorithm
function getShortestPath(waypoints) {
  if (waypoints.length < 2) return waypoints;

  // Start with the first waypoint
  const path = [waypoints[0]];
  let remaining = waypoints.slice(1);

  while (remaining.length > 0) {
    let lastPoint = path[path.length - 1];
    let minDistance = Infinity;
    let nearestIndex = 0;

    // Find nearest neighbor to the last point in path
    remaining.forEach((point, index) => {
      const dist = haversineDistance(lastPoint, point);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = index;
      }
    });

    // Add the nearest point to the path
    path.push(remaining[nearestIndex]);
    remaining.splice(nearestIndex, 1);
  }

  return path;
}

// Function to generate optimized connections between waypoints
function generateOptimizedLines(waypoints) {
  const lines = [];

  // Create direct connections between consecutive points
  for (let i = 0; i < waypoints.length - 1; i++) {
    lines.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [waypoints[i].longitude, waypoints[i].latitude],
          [waypoints[i + 1].longitude, waypoints[i + 1].latitude],
        ],
      },
      properties: {
        name: `Segment ${i + 1}`,
        description: `From ${waypoints[i].name} to ${waypoints[i + 1].name}`,
      },
    });
  }

  return lines;
}

function generateKmzBuffer(waypoints) {
  if (!waypoints || waypoints.length === 0) {
    throw new Error("No waypoints provided");
  }

  const sortedWaypoints = getShortestPath(waypoints);

  // Generate point features
  const pointFeatures = sortedWaypoints.map((wp) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [wp.longitude, wp.latitude],
    },
    properties: {
      name: wp.name,
      description: wp.description || "",
     
    },
  }));

  // Generate line features
  const lineFeatures = generateOptimizedLines(sortedWaypoints);

  const geojson = {
    type: "FeatureCollection",
    features: [...pointFeatures, ...lineFeatures],
    // Add KML styling information
    
  };

  const kml = tokml(geojson, {
    // documentName: "Optimized Waypoints Path",
    // documentDescription: "Path optimized for shortest distance between points",
    name: "name",
    description: "description",
  });

  const zip = new AdmZip();
  zip.addFile("doc.kml", Buffer.from(kml, "utf-8"));
  return zip.toBuffer();
}

module.exports = generateKmzBuffer;
