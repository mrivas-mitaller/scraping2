const axios = require("axios");

const scrapeBoostr = async (browser, patente) => {
  const apiKey = process.env.BOOSTR_API_KEY;
  if (!apiKey) {
    console.error("❌ BOOSTR_API_KEY no está definida en el entorno");
    return null;
  }

  const url = `https://api.boostr.cl/vehicle/${patente}.json`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json"
      }
    });

    const data = response.data.data;

    if (!data || !data.make) {
      console.warn("⚠️ No se encontraron datos válidos para la patente:", patente);
      return null;
    }

    return {
      patente: data.plate || patente,
      marca: data.make,
      modelo: data.model,
      version: data.version,
      anio: data.year,
      tipo: data.type,
      motor: data.engine,
      cilindrada: data.engine_size,
      chasis: data.chassis,
      color: data.color,
      puertas: data.doors,
      transmision: data.transmission,
      kilometraje: data.kilometers,
      combustible: data.gas_type,
      fabricante: data.manufacturer,
      region: data.region,
      pais_origen: data.country
    };
  } catch (error) {
    console.error("❌ Error al llamar la API de Boostr:", error.message);
    return null;
  }
};

module.exports = scrapeBoostr;
