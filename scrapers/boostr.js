const axios = require("axios");

const fetchVehicleData = async (patente) => {
  const apiUrl = `https://api.boostr.cl/vehicle/${patente}.json`;

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${process.env.BOOSTR_API_KEY}`
      }
    });

    return response.data?.data || null;
  } catch (err) {
    console.error("❌ Error al llamar la API de Boostr:", err.message);
    return null;
  }
};

module.exports = fetchVehicleData;
