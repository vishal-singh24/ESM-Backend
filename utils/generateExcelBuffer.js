const ExcelJS = require("exceljs");

async function generateExcelBuffer(waypoints) {
  const workbook = new ExcelJS.Workbook();

  // Create Inventory sheet
  const inventorySheet = workbook.addWorksheet("Inventory");
  setupInventorySheet(inventorySheet, waypoints);

  // Create Details of Material sheet
  const materialSheet = workbook.addWorksheet("Details of Material");
  setupMaterialSheet(materialSheet, waypoints);

  // Write to buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

function setupInventorySheet(sheet, waypoints) {
  // Set up columns with exact widths from template
  sheet.columns = [
    { header: "", key: "col1", width: 5 }, // A
    { header: "", key: "col2", width: 25 }, // B
    { header: "", key: "col3", width: 15 }, // C
    { header: "", key: "col4", width: 15 }, // D
    { header: "", key: "col5", width: 10 }, // E
    { header: "", key: "col6", width: 5 }, // F
    { header: "", key: "col7", width: 5 }, // G
    { header: "", key: "col8", width: 5 }, // H
    { header: "", key: "col9", width: 5 }, // I
    { header: "", key: "col10", width: 10 }, // J
  ];

  // Default styling
  const defaultFont = { name: "Arial", size: 10 };
  const boldFont = { ...defaultFont, bold: true };

  // Helper function to add formatted rows
  const addFormattedRow = (values, isBold = false) => {
    const row = sheet.addRow(values);
    row.height = 15;
    row.eachCell((cell, colNumber) => {
      cell.font = isBold ? boldFont : defaultFont;
      cell.alignment = { vertical: "middle", horizontal: "left" };
    });
    return row;
  };

  // Add route length information
  sheet.addRow([]);

  // The controller already ensures gpsDetails is the first item or undefined
  const totalLength =
    waypoints.reduce(
      (sum, wp) => sum + (wp.gpsDetails?.lengthInMeter || 0),
      0
    ) / 1000; // Convert meters to KM
  const existingLength =
    waypoints
      .filter((wp) => wp.routeType === "existing")
      .reduce((sum, wp) => sum + (wp.gpsDetails?.lengthInMeter || 0), 0) /
    1000; // Convert meters to KM

  addFormattedRow(
    [
      "",
      "Total Route Length",
      "",
      "",
      totalLength.toFixed(3),
      "",
      "",
      "",
      "",
      "KM.",
    ],
    true
  );
  addFormattedRow(
    [
      "",
      "Existing Length",
      "",
      "",
      existingLength.toFixed(3),
      "",
      "",
      "",
      "",
      "KM.",
    ],
    true
  );

  const newPropRow = addFormattedRow(
    [
      "",
      "New Proposed Length",
      "",
      "",
      { formula: "E2-E3" },
      "",
      "",
      "",
      "",
      "KM.",
    ],
    true
  );
  newPropRow.getCell("E").numFmt = "0.000";

  sheet.addRow([]);

  // Pole type headers
  const poleHeader = addFormattedRow(
    [
      "",
      "Type Of Pole",
      "PCC Pole/ PSC Pole",
      "RSJ Pole",
      "Rail Pole",
      "H-Beam Pole",
      "Tubular Pole",
      "Steel Tubular Pole",
      "Unit",
      "Total Qty.",
    ],
    true
  );
  poleHeader.eachCell((cell, colNumber) => {
    if (colNumber > 2)
      cell.alignment = { ...cell.alignment, horizontal: "center" };
  });

  sheet.addRow([]);

  // Pole types with counts
  const poleTypes = {
    "Line Pole": "PCC Pole/ PSC Pole",
    "Angle Pole /Shackle Pole": "RSJ Pole", // Corrected typo: Schackle -> Shackle
    "Tapping Pole": "Rail Pole",
    "Double Pole Structure": "H-Beam Pole",
  };

  Object.entries(poleTypes).forEach(([type, poleType]) => {
    // poleDetails is already the first item or undefined
    const count = waypoints.filter(
      (wp) => wp.poleDetails?.poleType === poleType
    ).length;
    const row = addFormattedRow(["", type]);
    row.getCell("C").value = count;
    row.getCell("C").alignment = { horizontal: "center" };
  });

  sheet.addRow([]); // Add one empty row after pole types for spacing

  // Transformer section
  addFormattedRow(["", "Transformer KV", "", "", "", "", "", "", "", ""], true);
  sheet.addRow([]);

  const transformerKVs = [
    "5KV",
    "10KV",
    "25KV",
    "100KV",
    "200KV",
    "250KV",
    "315KV",
    "400KV",
    "500KV",
  ];
  transformerKVs.forEach((kv) => {
    // gpsDetails is already the first item or undefined
    const count = waypoints.filter(
      (wp) => wp.gpsDetails?.transformerKV === kv
    ).length;
    const row = addFormattedRow(["", kv]);
    row.getCell("J").value = count;
    row.getCell("J").alignment = { horizontal: "center" };
  });

  sheet.addRow([]);

  // Materials section
  addFormattedRow(
    ["", "Description", "", "", "", "", "", "", "Unit", "Total Qty."],
    true
  );

  const materials = [
    {
      name: "3 Phase L.T. Distribution box",
      unit: "Nos.",
      key: "ltDistributionBox3Phase",
      formulaColumn: "P",
    }, // Maps to P column in Details of Material
    { name: "AB Switch", unit: "Set", key: "abSwitch", formulaColumn: "Q" },
    { name: "Anchor Rod", unit: "Nos.", key: "anchorRod", formulaColumn: "R" },
    {
      name: "Anchoring Assembly",
      unit: "Set",
      key: "anchoringAssembly",
      formulaColumn: "S",
    },
    {
      name: "Angle 4 Feet",
      unit: "Nos.",
      key: "angle4Feet",
      formulaColumn: "T",
    },
    {
      name: "Angle 9 Feet",
      unit: "Nos.",
      key: "angle9Feet",
      formulaColumn: "U",
    },
    { name: "Base Plat", unit: "Nos.", key: "basePlat", formulaColumn: "V" },
    {
      name: "Channel 4 Feet",
      unit: "Nos.",
      key: "channel4Feet",
      formulaColumn: "W",
    },
    {
      name: "Channel 9 Feet",
      unit: "Nos.",
      key: "channel9Feet",
      formulaColumn: "X",
    },
    { name: "DO Channel", unit: "Nos.", key: "doChannel", formulaColumn: "Y" },
    {
      name: "DO Channel Back Clamp",
      unit: "Nos.",
      key: "doChannelBackClamp",
      formulaColumn: "Z",
    },
    { name: "DO Fuse", unit: "Nos.", key: "doFuse", formulaColumn: "AA" },
    {
      name: "Disc Hardware",
      unit: "Nos.",
      key: "discHardware",
      formulaColumn: "AB",
    },
    {
      name: "Disc Insulator Polymeric",
      unit: "Nos.",
      key: "discInsulatorPolymeric",
      formulaColumn: "AC",
    },
    {
      name: "Disc Insulator Porcelain",
      unit: "Nos.",
      key: "discInsulatorPorcelain",
      formulaColumn: "AD",
    },
    {
      name: "DTR Base Channel",
      unit: "Nos.",
      key: "dtrBaseChannel",
      formulaColumn: "AE",
    },
    {
      name: "DTR Spotting Angle",
      unit: "Nos.",
      key: "dtrSpottingAngle",
      formulaColumn: "AF",
    },
    {
      name: "DTR Spotting Angle with Clamp",
      unit: "Nos.",
      key: "dtrSpottingAngleWithClamp",
      formulaColumn: "AG",
    },
    {
      name: "DVC Conductor",
      unit: "Mtr.",
      key: "dvcConductor",
      formulaColumn: "AH",
    },
    {
      name: "Earthing Conductor",
      unit: "Mtr.",
      key: "earthingConductor",
      formulaColumn: "AI",
    },
    { name: "Elbow", unit: "Nos.", key: "elbow", formulaColumn: "AJ" },
    { name: "Eye Bolt", unit: "Nos.", key: "eyeBolt", formulaColumn: "AK" },
    { name: "GI Pin", unit: "Nos.", key: "giPin", formulaColumn: "AL" },
    { name: "GI Pipe", unit: "Nos.", key: "giPipe", formulaColumn: "AM" },
    { name: "Greeper", unit: "Nos.", key: "greeper", formulaColumn: "AN" },
    {
      name: "Guy Insulator",
      unit: "Nos.",
      key: "guyInsulator",
      formulaColumn: "AO",
    },
    {
      name: "I Huck Clamp",
      unit: "Nos.",
      key: "iHuckClamp",
      formulaColumn: "AP",
    },
    {
      name: "Lighting Arrestor",
      unit: "Nos.",
      key: "lightingArrestor",
      formulaColumn: "AQ",
    },
    {
      name: "Pin Insulator Polymeric",
      unit: "Nos.",
      key: "pinInsulatorPolymeric",
      formulaColumn: "AR",
    },
    {
      name: "Pin Insulator Porcelain",
      unit: "Nos.",
      key: "pinInsulatorPorcelain",
      formulaColumn: "AS",
    },
    {
      name: "Pole Earthing",
      unit: "Nos.",
      key: "poleEarthing",
      formulaColumn: "AT",
    },
    { name: "Side Clamp", unit: "Nos.", key: "sideClamp", formulaColumn: "AU" },
    {
      name: "Spotting Angle",
      unit: "Nos.",
      key: "spottingAngle",
      formulaColumn: "AV",
    },
    {
      name: "Spotting Channel",
      unit: "Nos.",
      key: "spottingChannel",
      formulaColumn: "AW",
    },
    { name: "Stay Clamp", unit: "Nos.", key: "stayClamp", formulaColumn: "AX" },
    {
      name: "Stay Insulator",
      unit: "Nos.",
      key: "stayInsulator",
      formulaColumn: "AY",
    },
    { name: "Stay Rod", unit: "Nos.", key: "stayRoad", formulaColumn: "AZ" },
    {
      name: "Stay Wire 7/12",
      unit: "Mtr.",
      key: "stayWire712",
      formulaColumn: "BA",
    },
    {
      name: "Suspension Assembly Clamp",
      unit: "Nos.",
      key: "suspensionAssemblyClamp",
      formulaColumn: "BB",
    },
    {
      name: "Top Channel",
      unit: "Nos.",
      key: "topChannel",
      formulaColumn: "BC",
    },
    { name: "Top Clamp", unit: "Nos.", key: "topClamp", formulaColumn: "BD" },
    {
      name: "Turn Buckle",
      unit: "Nos.",
      key: "turnBuckle",
      formulaColumn: "BE",
    },
    {
      name: "V Cross Arm",
      unit: "Nos.",
      key: "vCrossArm",
      formulaColumn: "BF",
    },
    {
      name: "V Cross Arm Clamp",
      unit: "Nos.",
      key: "vCrossArmClamp",
      formulaColumn: "BG",
    },
    { name: "X Bressing", unit: "Nos.", key: "xBressing", formulaColumn: "BH" },
    {
      name: "Earthing Coil",
      unit: "Nos.",
      key: "earthingCoil",
      formulaColumn: "BI",
    },
  ];

  materials.forEach((material) => {
    const row = addFormattedRow([
      "",
      material.name,
      "",
      "",
      "",
      "",
      "",
      "",
      material.unit,
    ]);
    // The formula will now correctly reference the 'Details of Material' sheet
    // The row number for the SUM total in 'Details of Material' is waypoints.length + 2
    row.getCell("J").value = {
      formula: `'Details of Material'!${material.formulaColumn}${
        waypoints.length + 2
      }`, // +2 accounts for the initial blank row and the header row
    };
    row.getCell("J").alignment = { horizontal: "right" };
  });
}

function setupMaterialSheet(sheet, waypoints) {
  // Define columns with exact widths
  const columns = [
    { header: "Sr No.", key: "srNo", width: 8 },
    { header: "Time & Date", key: "timestamp", width: 50 },
    { header: "User ID", key: "userId", width: 35 },
    { header: "District", key: "district", width: 20 },
    { header: "Route Start Point", key: "routeStartPoint", width: 20 },
    { header: "Route End Point", key: "routeEndPoint", width: 20 },
    { header: "Length / Km.", key: "lengthInKm", width: 15 },
    { header: "GPS Coordinates Start Point", key: "startCoords", width: 35 },
    { header: "GPS Coordinates End Point", key: "endCoords", width: 35 },
    { header: "Substation Name", key: "substationName", width: 25 },
    { header: "Feeder Name", key: "feederName", width: 20 },
    { header: "Conductor", key: "conductor", width: 20 },
    { header: "Cable", key: "cable", width: 20 },
    { header: "Transformer Location", key: "transformerLocation", width: 20 },
    { header: "Transformer KV", key: "transformerKV", width: 15 },
    {
      header: "3 Phase L.T. Distribution box",
      key: "ltDistributionBox3Phase",
      width: 10,
    },
    { header: "AB Switch", key: "abSwitch", width: 10 },
    { header: "Anchor Rod", key: "anchorRod", width: 10 },
    { header: "Anchoring Assembly", key: "anchoringAssembly", width: 10 },
    { header: "Angle(4 Feet)", key: "angle4Feet", width: 10 },
    { header: "Angle(9 Feet)", key: "angle9Feet", width: 10 },
    { header: "Base Plat", key: "basePlat", width: 10 },
    { header: "Channel(4 Feet)", key: "channel4Feet", width: 10 },
    { header: "Channel(9 Feet)", key: "channel9Feet", width: 10 },
    { header: "D.O. Channel", key: "doChannel", width: 10 },
    { header: "D.O. Channel Back Clamp", key: "doChannelBackClamp", width: 10 },
    { header: "D.O. Fuse", key: "doFuse", width: 10 },
    { header: "Disc Hardware", key: "discHardware", width: 10 },
    {
      header: "Disc Insulator(Polymeric)",
      key: "discInsulatorPolymeric",
      width: 10,
    },
    {
      header: "Disc Insulator(Porcelain)",
      key: "discInsulatorPorcelain",
      width: 10,
    },
    { header: "DTR Base Channel", key: "dtrBaseChannel", width: 10 },
    { header: "DTR Spotting Angle", key: "dtrSpottingAngle", width: 10 },
    {
      header: "DTR Spotting Angle with Clamp",
      key: "dtrSpottingAngleWithClamp",
      width: 10,
    },
    { header: "DVC Conductor", key: "dvcConductor", width: 10 },
    { header: "Earthing Conductor", key: "earthingConductor", width: 10 },
    { header: "Elbow", key: "elbow", width: 10 },
    { header: "Eye-Bolt", key: "eyeBolt", width: 10 },
    { header: "GI Pin", key: "giPin", width: 10 },
    { header: "GI Pipe", key: "giPipe", width: 10 },
    { header: "Greeper", key: "greeper", width: 10 },
    { header: "Guy Insulator", key: "guyInsulator", width: 10 },
    { header: "I Huck Clamp", key: "iHuckClamp", width: 10 },
    { header: "Lighting Arrestor", key: "lightingArrestor", width: 10 },
    {
      header: "Pin Insulator(Polymeric)",
      key: "pinInsulatorPolymeric",
      width: 10,
    },
    {
      header: "Pin Insulator (Porcelain)",
      key: "pinInsulatorPorcelain",
      width: 10,
    },
    { header: "Pole Earthing", key: "poleEarthing", width: 10 },
    { header: "Side Clamp", key: "sideClamp", width: 10 },
    { header: "Spotting Angle", key: "spottingAngle", width: 10 },
    { header: "Spotting Channel", key: "spottingChannel", width: 10 },
    { header: "Stay Clamp", key: "stayClamp", width: 10 },
    { header: "Stay Insulator", key: "stayInsulator", width: 10 },
    { header: "Stay Road", key: "stayRoad", width: 10 },
    { header: "Stay Wire 7/12", key: "stayWire712", width: 10 },
    {
      header: "Suspension Assembly Clamp",
      key: "suspensionAssemblyClamp",
      width: 10,
    },
    { header: "Top Channel", key: "topChannel", width: 10 },
    { header: "Top Clamp", key: "topClamp", width: 10 },
    { header: "Turn Buckle", key: "turnBuckle", width: 10 },
    { header: "V Cross Arm", key: "vCrossArm", width: 10 },
    { header: "V Cross Arm Clamp", key: "vCrossArmClamp", width: 10 },
    { header: "X Bressing", key: "xBressing", width: 10 },
    { header: "Earthing Coil", key: "earthingCoil", width: 10 },
    { header: "Pole No.", key: "poleNo", width: 10 },
    { header: "Existing / New Proposed", key: "proposalType", width: 20 },
    { header: "Pole Description", key: "poleDescription", width: 25 },
    { header: "Pole Type", key: "poleType", width: 20 },
    { header: "Pole Size / Mtr.", key: "poleSizeInMeter", width: 15 },
    {
      header: "3 Phase L.T. Distribution box",
      key: "poleltDistributionBox3Phase",
      width: 10,
    },
    { header: "AB Switch", key: "poleabSwitch", width: 10 },
    { header: "Anchor Rod", key: "poleanchorRod", width: 10 },
    { header: "Anchoring Assembly", key: "poleanchoringAssembly", width: 10 },
    { header: "Angle(4 Feet)", key: "poleangle4Feet", width: 10 },
    { header: "Angle(9 Feet)", key: "poleangle9Feet", width: 10 },
    { header: "Base Plat", key: "polebasePlat", width: 10 },
    { header: "Channel(4 Feet)", key: "polechannel4Feet", width: 10 },
    { header: "Channel(9 Feet)", key: "polechannel9Feet", width: 10 },
    { header: "D.O. Channel", key: "poledoChannel", width: 10 },
    { header: "D.O. Channel Back Clamp", key: "poledoChannelBackClamp", width: 10 },
    { header: "D.O. Fuse", key: "poledoFuse", width: 10 },
    { header: "Disc Hardware", key: "polediscHardware", width: 10 },
    {
      header: "Disc Insulator(Polymeric)",
      key: "polediscInsulatorPolymeric",
      width: 10,
    },
    {
      header: "Disc Insulator(Porcelain)",
      key: "polediscInsulatorPorcelain",
      width: 10,
    },
    { header: "DTR Base Channel", key: "poledtrBaseChannel", width: 10 },
    { header: "DTR Spotting Angle", key: "poledtrSpottingAngle", width: 10 },
    // {
    //   header: "DTR Spotting Angle with Clamp",
    //   key: "dtrSpottingAngleWithClamp",
    //   width: 10,
    // },
    { header: "DVC Conductor", key: "poledvcConductor", width: 10 },
    { header: "Earthing Conductor", key: "poleearthingConductor", width: 10 },
    { header: "Elbow", key: "poleelbow", width: 10 },
    { header: "Eye-Bolt", key: "poleeyeBolt", width: 10 },
    { header: "GI Pin", key: "polegiPin", width: 10 },
    { header: "GI Pipe", key: "polegiPipe", width: 10 },
    { header: "Greeper", key: "polegreeper", width: 10 },
    { header: "Guy Insulator", key: "poleguyInsulator", width: 10 },
    { header: "I Huck Clamp", key: "poleiHuckClamp", width: 10 },
    { header: "Lighting Arrestor", key: "polelightingArrestor", width: 10 },
    {
      header: "Pin Insulator(Polymeric)",
      key: "polepinInsulatorPolymeric",
      width: 10,
    },
    {
      header: "Pin Insulator (Porcelain)",
      key: "polepinInsulatorPorcelain",
      width: 10,
    },
    { header: "Pole Earthing", key: "polepoleEarthing", width: 10 },
    { header: "Side Clamp", key: "polesideClamp", width: 10 },
    { header: "Spotting Angle", key: "polespottingAngle", width: 10 },
    { header: "Spotting Channel", key: "polespottingChannel", width: 10 },
    { header: "Stay Clamp", key: "polestayClamp", width: 10 },
    { header: "Stay Insulator", key: "polestayInsulator", width: 10 },
    { header: "Stay Road", key: "polestayRoad", width: 10 },
    { header: "Stay Wire 7/12", key: "polestayWire712", width: 10 },
    {
      header: "Suspension Assembly Clamp",
      key: "polesuspensionAssemblyClamp",
      width: 10,
    },
    { header: "Top Channel", key: "poletopChannel", width: 10 },
    { header: "Top Clamp", key: "poletopClamp", width: 10 },
    { header: "Turn Buckle", key: "poleturnBuckle", width: 10 },
    { header: "V Cross Arm", key: "polevCrossArm", width: 10 },
    { header: "V Cross Arm Clamp", key: "polevCrossArmClamp", width: 10 },
    { header: "X Bressing", key: "polexBressing", width: 10 },
    { header: "Earthing Coil", key: "poleearthingCoil", width: 10 },
  ];

  sheet.columns = columns; // Set sheet columns

  // Add header row
  sheet.addRow(); // Adds an empty row for spacing before the header
  const headerRow = sheet.addRow(columns.map((col) => col.header));
  headerRow.height = 60;
  headerRow.eachCell((cell, colNumber) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };

    // Define keys that should have regular font (not bold) in the header
    const materialKeysForRegularFont = [
      "ltDistributionBox3Phase",
      "abSwitch",
      "anchorRod",
      "anchoringAssembly",
      "angle4Feet",
      "angle9Feet",
      "basePlat",
      "channel4Feet",
      "channel9Feet",
      "doChannel",
      "doChannelBackClamp",
      "doFuse",
      "discHardware",
      "discInsulatorPolymeric",
      "discInsulatorPorcelain",
      "dtrBaseChannel",
      "dtrSpottingAngle",
      "dtrSpottingAngleWithClamp",
      "dvcConductor",
      "earthingConductor",
      "elbow",
      "eyeBolt",
      "giPin",
      "giPipe",
      "greeper",
      "guyInsulator",
      "iHuckClamp",
      "lightingArrestor",
      "pinInsulatorPolymeric",
      "pinInsulatorPorcelain",
      "poleEarthing",
      "sideClamp",
      "spottingAngle",
      "spottingChannel",
      "stayClamp",
      "stayInsulator",
      "stayRoad",
      "stayWire712",
      "suspensionAssemblyClamp",
      "topChannel",
      "topClamp",
      "turnBuckle",
      "vCrossArm",
      "vCrossArmClamp",
      "xBressing",
      "earthingCoil",
    ];

    // Get the key of the current column
    const currentColumnKey = columns[colNumber - 1]?.key;

    if (materialKeysForRegularFont.includes(currentColumnKey)) {
      cell.font = { name: "Arial", size: 9, bold: false };
    } else {
      // Apply default styles to all other cells
      cell.font = { name: "Arial", size: 9, bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF7CAAC" },
      };
    }
  });

  // Add data rows
  waypoints.forEach((wp, index) => {
    // These are already the first item or undefined from the controller
    // If the controller ensures poleDetails and gpsDetails are single objects,
    // then no need for ?.[0] here. Using || {} for safety if they are null/undefined.
    const poleDetails = wp.poleDetails || {};
    const gpsDetails = wp.gpsDetails || {};

    const rowData = {
      srNo: index + 1,
      timestamp: formatDate( wp.timestamp ),
      userId: gpsDetails.userId || "",
      district: gpsDetails.district || "",
      routeStartPoint: gpsDetails.routeStartPoint || "",
      routeEndPoint: wp.routeEndingPoint || "", // Assuming routeEndingPoint from WaypointSchema
      lengthInKm: (gpsDetails.lengthInMeter || 0) / 1000, // Convert meters to KM
      startCoords: `${gpsDetails.startPointCoordinates?.latitude || ""}, ${
        gpsDetails.startPointCoordinates?.longitude || ""
      }`,
      endCoords: `${gpsDetails.currentWaypointCoordinates?.latitude || ""}, ${
        gpsDetails.currentWaypointCoordinates?.longitude || ""
      }`, // Using current waypoint for end coords
      substationName: gpsDetails.substationName || "",
      feederName: gpsDetails.feederName || "",
      conductor: gpsDetails.conductor || "", // Conductor is in GpsDetailsSchema
      cable: gpsDetails.cable || "",
      transformerLocation: gpsDetails.transformerLocation || "",
      transformerKV: gpsDetails.transformerKV || "",
      ltDistributionBox3Phase: gpsDetails.ltDistributionBox3Phase || 0,
      abSwitch: gpsDetails.abSwitch || 0,
      anchorRod: gpsDetails.anchorRod || 0,
      anchoringAssembly: gpsDetails.anchoringAssembly || 0,
      angle4Feet: gpsDetails.angle4Feet || 0,
      angle9Feet: gpsDetails.angle9Feet || 0,
      basePlat: gpsDetails.basePlat || 0,
      channel4Feet: gpsDetails.channel4Feet || 0,
      channel9Feet: gpsDetails.channel9Feet || 0,
      doChannel: gpsDetails.doChannel || 0,
      doChannelBackClamp: gpsDetails.doChannelBackClamp || 0,
      doFuse: gpsDetails.doFuse || 0,
      discHardware: gpsDetails.discHardware || 0,
      discInsulatorPolymeric: gpsDetails.discInsulatorPolymeric || 0,
      discInsulatorPorcelain: gpsDetails.discInsulatorPorcelain || 0,
      dtrBaseChannel: gpsDetails.dtrBaseChannel || 0,
      dtrSpottingAngle: gpsDetails.dtrSpottingAngle || 0,
      dtrSpottingAngleWithClamp: gpsDetails.dtrSpottingAngleWithClamp || 0,
      dvcConductor: gpsDetails.dvcConductor || 0,
      earthingConductor: gpsDetails.earthingConductor || 0,
      elbow: gpsDetails.elbow || 0,
      eyeBolt: gpsDetails.eyeBolt || 0,
      giPin: gpsDetails.giPin || 0,
      giPipe: gpsDetails.giPipe || 0,
      greeper: gpsDetails.greeper || 0,
      guyInsulator: gpsDetails.guyInsulator || 0,
      iHuckClamp: gpsDetails.iHuckClamp || 0,
      lightingArrestor: gpsDetails.lightingArrestor || 0,
      pinInsulatorPolymeric: gpsDetails.pinInsulatorPolymeric || 0,
      pinInsulatorPorcelain: gpsDetails.pinInsulatorPorcelain || 0,
      poleEarthing: gpsDetails.poleEarthing || 0,
      sideClamp: gpsDetails.sideClamp || 0,
      spottingAngle: gpsDetails.spottingAngle || 0,
      spottingChannel: gpsDetails.spottingChannel || 0,
      stayClamp: gpsDetails.stayClamp || 0,
      stayInsulator: gpsDetails.stayInsulator || 0,
      stayRoad: gpsDetails.stayRoad || 0,
      stayWire712: gpsDetails.stayWire712 || 0,
      suspensionAssemblyClamp: gpsDetails.suspensionAssemblyClamp || 0,
      topChannel: gpsDetails.topChannel || 0,
      topClamp: gpsDetails.topClamp || 0,
      turnBuckle: gpsDetails.turnBuckle || 0,
      vCrossArm: gpsDetails.vCrossArm || 0,
      vCrossArmClamp: gpsDetails.vCrossArmClamp || 0,
      xBressing: gpsDetails.xBressing || 0,
      earthingCoil: gpsDetails.earthingCoil || 0,

      // Pole details are sourced from poleDetails object
      poleNo: poleDetails.poleNo || "",
      proposalType: poleDetails.existingOrNewProposed || "",
      poleDescription: poleDetails.poleDiscription || "", // Corrected typo here
      poleType: poleDetails.poleType || "",
      poleSizeInMeter: poleDetails.poleSizeInMeter || "",
      poleltDistributionBox3Phase: poleDetails._3PhaseLTDistributionBox || 0,
      poleabSwitch: poleDetails.abSwitch || 0,
      poleanchorRod: poleDetails.anchorRod || 0,
      poleanchoringAssembly: poleDetails.anchoringAssembly || 0,
      poleangle4Feet: poleDetails.angle4Feet || 0,
      poleangle9Feet: poleDetails.angle9Feet || 0,
      polebasePlat: poleDetails.basePlat || 0,
      polechannel4Feet: poleDetails.channel4Feet || 0,
      polechannel9Feet: poleDetails.channel9Feet || 0,
      poledoChannel: poleDetails.doChannel || 0,
      poledoChannelBackClamp: poleDetails.doChannelBackClamp || 0,
      poledoFuse: poleDetails.doFuse || 0,
      polediscHardware: poleDetails.discHardware || 0,
      polediscInsulatorPolymeric: poleDetails.discInsulatorPolymeric || 0,
      polediscInsulatorPorcelain: poleDetails.discInsulatorPorcelain || 0,
      poledtrBaseChannel: poleDetails.dtrBaseChannel || 0,
      poledtrSpottingAngle: poleDetails.dtrSpottingAngle || 0,
      //dtrSpottingAngleWithClamp: poleDetails.dtrSpottingAngleWithClamp || 0,
      poledvcConductor: poleDetails.dvcConductor || 0,
      poleearthingConductor: poleDetails.earthingConductor || 0,
      poleelbow: poleDetails.elbow || 0,
      poleeyeBolt: poleDetails.eyeBolt || 0,
      polegiPin: poleDetails.giPin || 0,
      polegiPipe: poleDetails.giPipe || 0,
      polegreeper: poleDetails.greeper || 0,
      poleguyInsulator: poleDetails.guyInsulator || 0,
      poleiHuckClamp: poleDetails.iHuckClamp || 0,
      polelightingArrestor: poleDetails.lightingArrestor || 0,
      polepinInsulatorPolymeric: poleDetails.pinInsulatorPolymeric || 0,
      polepinInsulatorPorcelain: poleDetails.pinInsulatorPorcelain || 0,
      polepoleEarthing: poleDetails.poleEarthing || 0,
      polesideClamp: poleDetails.sideClamp || 0,
      polespottingAngle: poleDetails.spottingAngle || 0,
      polespottingChannel: poleDetails.spottingChannel || 0,
      polestayClamp: poleDetails.stayClamp || 0,
      polestayInsulator: poleDetails.stayInsulator || 0,
      polestayRoad: poleDetails.stayRoad || 0,
      polestayWire712: poleDetails.stayWire712 || 0,
      polesuspensionAssemblyClamp: poleDetails.suspensionAssemblyClamp || 0,
      poletopChannel: poleDetails.topChannel || 0,
      poletopClamp: poleDetails.topClamp || 0,
      poleturnBuckle: poleDetails.turnBuckle || 0,
      polevCrossArm: poleDetails.vCrossArm || 0,
      polevCrossArmClamp: poleDetails.vCrossArmClamp || 0,
      polexBressing: poleDetails.xBressing || 0,
      poleearthingCoil: poleDetails.earthingCoil || 0,
    };

    const row = sheet.addRow(Object.values(rowData));
    row.height = 15;
    row.eachCell((cell) => {
      cell.font = { name: "Arial", size: 10 };
      cell.alignment = { vertical: "middle", horizontal: "middle" };
    });

    // Format numeric cells.
    Object.keys(rowData).forEach((key, colIndex) => {
      // Find the column definition for the current key
      const columnDef = columns.find((col) => col.key === key);
      if (typeof rowData[key] === "number" && columnDef) {
        // Only apply numeric format if the column is one of the material quantities
        const materialKeys = [
          "ltDistributionBox3Phase", "abSwitch", "anchorRod", "anchoringAssembly",
          "angle4Feet", "angle9Feet", "basePlat", "channel4Feet", "channel9Feet",
          "doChannel", "doChannelBackClamp", "doFuse", "discHardware",
          "discInsulatorPolymeric", "discInsulatorPorcelain", "dtrBaseChannel",
          "dtrSpottingAngle", "dtrSpottingAngleWithClamp", "dvcConductor",
          "earthingConductor", "elbow", "eyeBolt", "giPin", "giPipe", "greeper",
          "guyInsulator", "iHuckClamp", "lightingArrestor", "pinInsulatorPolymeric",
          "pinInsulatorPorcelain", "poleEarthing", "sideClamp", "spottingAngle",
          "spottingChannel", "stayClamp", "stayInsulator", "stayRoad", "stayWire712",
          "suspensionAssemblyClamp", "topChannel", "topClamp", "turnBuckle",
          "vCrossArm", "vCrossArmClamp", "xBressing", "earthingCoil"
        ];
        if (materialKeys.includes(key)) {
            row.getCell(colIndex + 1).numFmt = "0"; // ExcelJS is 1-indexed for columns
        }
      }
    });
  });

  // Add totals row
  // The total row will be at `waypoints.length + 2` because of the initial blank row and the header row.
  const totalRow = sheet.addRow([]);
  totalRow.height = 15;
  totalRow.getCell(1).value = "Total Length:"; // Column A
  totalRow.getCell(7).value = { formula: `SUM(G3:G${waypoints.length + 2})` }; // Sums from G3 (first data row) to the row before the total row
  totalRow.getCell(7).numFmt = "0.000"; // Format for length in KM
  totalRow.getCell(15).value = "Total :"; // Column O (Transformer KV) - Assuming this is where you want "Total" text before material totals

  // Add totals for material columns
  const firstMaterialColIndex = columns.findIndex((col) => col.key === "ltDistributionBox3Phase") + 1;
  const lastMaterialColIndex = columns.findIndex((col) => col.key === "earthingCoil") + 1; // Corrected to use the actual last material key

  for (let i = firstMaterialColIndex; i <= lastMaterialColIndex; i++) {
    const colLetter = getColumnLetter(i); // Helper function to get column letter
    totalRow.getCell(i).value = {
      formula: `SUM(${colLetter}3:${colLetter}${waypoints.length + 1})`, // Sums from data start to end
    };
    totalRow.getCell(i).numFmt = "0"; // Format for material counts
  }

  // Style totals row
  totalRow.eachCell((cell) => {
    if (cell.value) {
      cell.font = { name: "Arial", size: 10, bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9D9D9" },
      };
    }
  });
}

// function formatDate(date) {
//   if (!date) return "";
//   const d = new Date(date);
//   const pad = (num) => num.toString().padStart(2, "0");

//   let hours = d.getHours();
//   const ampm = hours >= 12 ? "pm" : "am";
//   hours = hours % 12;
//   hours = hours ? hours : 12; // The hour '0' should be '12'

//   return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}_${hours}.${pad(
//     d.getMinutes()
//   )}${ampm}`;
// }

function formatDate(timestamp) {
  if (!timestamp) return "";
  
  try {
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.log('Invalid date:', timestamp);
      return "";
    }

    const pad = (num) => num.toString().padStart(2, "0");
    
    // Get local time components
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours || 12; // Convert 0 to 12
    
    const minutes = pad(date.getMinutes());
    
    return `${day}-${month}-${year}_${hours}.${minutes}${ampm}`;
  } catch (e) {
    console.log('Error formatting date:', e);
    return "";
  }
}

// Helper function to convert column number to letter (e.g., 1 -> A, 27 -> AA)
function getColumnLetter(colIndex) {
  let temp,
    letter = "";
  while (colIndex > 0) {
    temp = (colIndex - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    colIndex = (colIndex - temp - 1) / 26;
  }
  return letter;
}

module.exports = generateExcelBuffer;