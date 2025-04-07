const axios = require('axios');

module.exports = async function consultarBoostr(patente) {
  try {
    const response = await axios.get(`https://api.boostr.cl/v1/vehicle/${patente}`, {
      headers: {
        Authorization: `Bearer ${process.env.BOOSTR_API_KEY}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("❌ Error consultando Boostr:", error.response?.data || error.message);
    return null;
  }
};
