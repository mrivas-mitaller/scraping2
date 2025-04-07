const axios = require("axios");

module.exports = async function scrapeBoostr(patente) {
  try {
    const response = await axios.get(`https://api.boostr.cl/patente/${patente}`, {
      headers: {
        Authorization: `Bearer ${process.env.BOOSTR_API_KEY}`,
        Accept: "application/json",
      },
    });

    const data = response.data;

    if (!data || data.status !== "success") {
      console.warn("⚠️ No se obtuvo resultado válido de la API");
      return null;
    }

    return {
      patente: patente,
      marca: data.data.make,
      modelo: data.data.model,
      anio: data.data.year,
      tipo: data.data.type,
      color: data.data.color,
      motor: data.data.engine,
      chasis: data.data.chassis,
      transmission: data.data.transmission,
      combustible: data.data.gas_type,
      version: data.data.version,
      valuation: data.data.valuation,
      owner_rut: data.data.owner?.documentNumber || null,
      owner_nombre: data.data.owner?.fullname || null,
      source: "boostr_api",
    };
  } catch (error) {
    console.error("❌ Error al llamar la API de Boostr:", error.message);
    return null;
  }
};

