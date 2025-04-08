const apisChile = require('@api/apis-chile');

const scrapeBoostr = async (browser, patente) => {
  try {
    apisChile.auth(process.env.BOOSTR_API_KEY);

    const response = await apisChile.carPlate({ plate: patente });

    const data = response.data;

    return {
      patente: data.plate,
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
      kilometros: data.kilometers,
      combustible: data.gas_type,
      fabricante: data.manufacturer,
      origen_region: data.region,
      origen_pais: data.country
    };
  } catch (error) {
    console.error("❌ Error al llamar la API de Boostr:", error.message);
    return null;
  }
};

module.exports = scrapeBoostr;
