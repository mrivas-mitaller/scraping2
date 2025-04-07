const axios = require("axios");

const scrapeBoostr = async (patente) => {
  try {
    const url = `https://api.boostr.cl/vehicle/${encodeURIComponent(patente)}.json`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.BOOSTR_API_KEY}`
      }
    });

    const data = response.data;

    // Puedes mapear los datos si es necesario, por ejemplo:
    return {
      patente: patente.toUpperCase(),
      marca: data.make,
      modelo: data.model,
      anio: data.year,
      tipo: data.type,
      color: data.color
      // agrega más campos según el output exacto de Boostr
    };
  } catch (error) {
    console.error("❌ Error al llamar la API de Boostr:", error.message);
    return null;
  }
};

module.exports = scrapeBoostr;


