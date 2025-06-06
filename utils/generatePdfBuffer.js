const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const ICON_MAP = {
  existing_transformer: "existing_transformer.png",
  new_transformer: "new_transformer.png",
  existing_double_pole: "existing_double_pole.png",
  new_double_pole: "new_double_pole.png",
  existing_standard_pole: "existing_standard_pole.png",
  new_standard_pole: "new_standard_pole.png",
};

// Determine which icon to use based on waypoint
function determineIconKey(waypoint) {
  const gps = Array.isArray(waypoint.gpsDetails)
    ? waypoint.gpsDetails[0]
    : waypoint.gpsDetails;

  if (gps?.transformerType) {
    const type = gps.transformerType.toLowerCase();
    if (type.includes("existing")) return "existing_transformer";
    if (type.includes("new")) return "new_transformer";
  }

  if (waypoint.poleDetails?.length > 0) {
    const pole = waypoint.poleDetails[0];
    const poleType = (pole.poleType || "").toLowerCase();
    const status = (pole.existingOrNewProposed || "").toLowerCase();
    const isDouble = poleType.includes("double") || poleType.includes("dtr");
    return isDouble ? `${status}_double_pole` : `${status}_standard_pole`;
  }

  return null;
}

// Get color based on routeType
function getRouteColor(routeType) {
  const type = (routeType || "").toLowerCase();
  if (type.includes("existing")) return "black";
  if (type.includes("new")) return "#FB8500";
  return "black";
}

// Shortest path = original order for now
function getShortestPath(waypoints) {
  return waypoints;
}

async function generatePdfBuffer(waypoints) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      const sortedWaypoints = getShortestPath(waypoints);
      if (sortedWaypoints.length === 0) {
        doc.text("No waypoints to display").end();
        return;
      }

      // Coordinate bounds
      const latitudes = sortedWaypoints.map((wp) => wp.latitude);
      const longitudes = sortedWaypoints.map((wp) => wp.longitude);
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLon = Math.min(...longitudes);
      const maxLon = Math.max(...longitudes);

      const pageWidth = 500;
      const pageHeight = 400;
      const margin = 50;
      const width = pageWidth - 2 * margin;
      const height = pageHeight - 2 * margin;

      function scaleX(lon) {
        const range = maxLon - minLon || 0.0001;
        return margin + ((lon - minLon) / range) * width;
      }

      function scaleY(lat) {
        const range = maxLat - minLat || 0.0001;
        return margin + ((maxLat - lat) / range) * height;
      }

      // Draw map with connected lines and symbols
      doc.fontSize(16).text("Waypoint Map", { underline: true });
      doc.moveDown(1);

      const coords = [];

      for (let i = 0; i < sortedWaypoints.length; i++) {
        const wp = sortedWaypoints[i];
        const x = scaleX(wp.longitude);
        const y = scaleY(wp.latitude);
        const iconKey = determineIconKey(wp);
        const iconPath = iconKey
          ? path.join(__dirname, "../icons", ICON_MAP[iconKey])
          : null;

        coords.push({ x, y, routeColor: getRouteColor(wp.routeType) });

        if (iconPath && fs.existsSync(iconPath)) {
          doc.image(iconPath, x - 10, y - 10, { width: 20, height: 20 });
        } else {
          doc.circle(x, y, 4).fill(getRouteColor(wp.routeType));
        }

        doc
          .fontSize(8)
          .fillColor("black")
          .text(`${wp.name}`, x + 5, y - 5);
      }

      for (let i = 0; i < coords.length - 1; i++) {
        const { x: x1, y: y1, routeColor } = coords[i];
        const { x: x2, y: y2 } = coords[i + 1];
        doc
          .moveTo(x1, y1)
          .lineTo(x2, y2)
          .strokeColor(routeColor)
          .lineWidth(2)
          .stroke();
      }

      // Add Legend
      doc.addPage().fontSize(16).text("Legend", { underline: true });
      doc.fontSize(12).fillColor("black");

      Object.entries(ICON_MAP).forEach(([key, file]) => {
        const iconPath = path.join(__dirname, "../icons", file);
        if (fs.existsSync(iconPath)) {
          doc.image(iconPath, { width: 20, height: 20, continued: true });
        }
        doc.text(` ${key.replace(/_/g, " ")}`);
        doc.moveDown(0.5);
      });

      doc.moveDown(1);
      doc
        .circle(doc.x + 5, doc.y + 6, 5)
        .fill("green")
        .stroke();
      doc.fillColor("black").text("  Existing Route", doc.x + 15, doc.y - 5);
      doc.moveDown(1);

      doc
        .circle(doc.x + 5, doc.y + 6, 5)
        .fill("red")
        .stroke();
      doc.fillColor("black").text("  New Route", doc.x + 15, doc.y - 5);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = generatePdfBuffer;
