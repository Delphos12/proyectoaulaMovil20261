const admin = require("firebase-admin");
const path = require("path");


const serviceAccountPath = path.join(__dirname, "../serviceAccountKey.json");


const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function initializeData() {
  try {
    console.log(" Iniciando carga de datos de prueba...\n");

  
    const zonesData = [
      {
        id: "zona-centro",
        name: "Zona Centro",
        address: "Calle Principal 123, Centro",
        description: "Parqueadero en el corazón del centro comercial",
        totalSlots: 50,
        occupiedSlots: 15,
        reservedSlots: 5,
        pricePerHour: 2.5,
        latitude: 4.711,
        longitude: -74.0087,
      },
      {
        id: "zona-norte",
        name: "Zona Norte",
        address: "Avenida Caracas 456, Chapinero",
        description: "Zona norte moderna con vigilancia 24/7",
        totalSlots: 75,
        occupiedSlots: 20,
        reservedSlots: 10,
        pricePerHour: 3.0,
        latitude: 4.725,
        longitude: -74.0521,
      },
      {
        id: "zona-sur",
        name: "Zona Sur",
        address: "Carrera 7a 789, Kennedy",
        description: "Parqueadero con servicio de lavado",
        totalSlots: 60,
        occupiedSlots: 25,
        reservedSlots: 8,
        pricePerHour: 2.0,
        latitude: 4.597,
        longitude: -74.08,
      },
    ];

    const slotsPerZone = {
      "zona-centro": generateSlots("A", 50),
      "zona-norte": generateSlots("B", 75),
      "zona-sur": generateSlots("C", 60),
    };

    console.log("Creando zonas...");
    for (const zone of zonesData) {
      const zoneId = zone.id;
      delete zone.id;

      await db.collection("parkingZones").doc(zoneId).set(zone);
      console.log(`Zona creada: ${zone.name}`);

    
      console.log(`Agregando ${slotsPerZone[zoneId].length} cupos...`);
      const batch = db.batch();

      slotsPerZone[zoneId].forEach((slot, index) => {
        const slotRef = db
          .collection("parkingZones")
          .doc(zoneId)
          .collection("slots")
          .doc(`slot-${index + 1}`);
        batch.set(slotRef, slot);
      });

      await batch.commit();
      console.log(`Cupos agregados a ${zone.name}\n`);
    }

    console.log("¡Datos de prueba cargados exitosamente!");
    console.log("\nEstadísticas:");
    console.log(`- Zonas: ${zonesData.length}`);
    console.log(
      `  - Total de cupos: ${Object.values(slotsPerZone).reduce((a, b) => a + b.length, 0)}`,
    );

    process.exit(0);
  } catch (error) {
    console.error("Error al cargar datos:", error);
    process.exit(1);
  }
}

function generateSlots(prefix, count) {
  const slotTypes = ["regular", "handicapped", "motorcycle", "electric"];
  const statuses = ["available", "occupied", "reserved"];
  const slots = [];

  for (let i = 1; i <= count; i++) {
    const slotType = slotTypes[(i - 1) % slotTypes.length];
    const status = i <= 8 ? statuses[1] : i <= 13 ? statuses[2] : statuses[0];

    slots.push({
      slotNumber: `${prefix}${i}`,
      type: slotType,
      status: status,
      location: `Fila ${Math.ceil(i / 10)}, Puesto ${((i - 1) % 10) + 1}`,
      floor: Math.ceil(i / 25),
    });
  }

  return slots;
}

initializeData();
