const express = require('express');
const axios = require('axios');
const router = express.Router();

const HERE_API_KEY = process.env.HERE_API_KEY;
const OPEN_CHARGE_API_KEY = process.env.OPEN_CHARGE_API_KEY;

router.get('/charging-stations', async (req, res) => {
  const { lat, lon } = req.query;

  try {
    const response = await axios.get(`https://api.openchargemap.io/v3/poi`, {
      params: {
        output: 'json',
        latitude: lat,
        longitude: lon,
        distance: 10,
        distanceunit: 'km',
        maxresults: 10,
        key: '606b8b03-b674-4d69-b83b-0da78bd23c8c',
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching charging stations:', error);
    res.status(500).json({ error: 'Error fetching charging stations' });
  }
});

module.exports = router;