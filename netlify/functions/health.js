// Netlify serverless function for health check
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    },
    body: JSON.stringify({
      status: 'OK',
      message: 'Neureal dApp is running on Netlify',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    })
  };
};
