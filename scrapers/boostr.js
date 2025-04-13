// scrapers/boostr.js

const axios = require("axios");

module.exports = async function fetchVehicleData(patente) {
  const url = `https://api.boostr.cl/vehicle/${patente}.json`;

  try {
    const response = await axios.get(url, {
      headers: {
        "X-API-KEY": process.env.BOOSTR_API_KEY,
      },
    });

    if (response.data?.status !== "success") {
      console.error("❌ Boostr respondió con error:", response.data);
      return null;
    }

    const d = response.data.data;

    return {
      patente: d.plate,
      marca: d.make,
      modelo: d.model,
      version: d.version,
      anio: d.year,
      tipo: d.type,
      motor: d.engine,
      cilindrada: d.engine_size,
      chasis: d.chassis,
      color: d.color,
      puertas: d.doors,
      transmision: d.transmission,
      kilometros: d.kilometers,
      combustible: d.gas_type,
      fabricante: d.manufacturer,
      region: d.region,
      pais: d.country,
      fuente: "boostr",
    };
  } catch (err) {
    console.error("❌ Error al llamar la API de Boostr:", err.message);
    return null;
  }
};
