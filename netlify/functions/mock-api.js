// Mock API endpoints for Netlify deployment
exports.handler = async (event, context) => {
  const { httpMethod, path, queryStringParameters, body } = event;
  
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Handle preflight requests
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Mock data
    const mockPrice = 0.15 + (Math.random() - 0.5) * 0.01;
    const mockRound = {
      roundId: 1,
      startTime: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
      lockTime: Date.now() + 22 * 60 * 60 * 1000, // 22 hours from now
      endTime: Date.now() + 46 * 60 * 60 * 1000, // 46 hours from now
      startPrice: mockPrice.toString(),
      lockPrice: null,
      endPrice: null,
      totalUpAmount: "1250.5",
      totalDownAmount: "875.2",
      state: "ACTIVE",
      resolved: false,
      winningPosition: null,
      statistics: {
        totalParticipants: 23,
        averageStake: "92.4"
      },
      timeRemaining: {
        toLock: 22 * 60 * 60, // 22 hours in seconds
        toEnd: 46 * 60 * 60   // 46 hours in seconds
      }
    };

    const mockStats = {
      overview: {
        totalUsers: 1234,
        activeUsers: 567,
        totalRounds: 89,
        activeRounds: 1,
        totalPredictions: 5678,
        totalVolume: "2500000.50",
        avgParticipants: 25.6
      },
      recent: {
        newUsers24h: 45,
        predictions24h: 123,
        volume24h: "45000.25"
      }
    };

    // Route handling
    const endpoint = path.replace('/.netlify/functions/mock-api', '');
    
    switch (endpoint) {
      case '/api/v1/rounds/current':
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: mockRound
          })
        };

      case '/api/v1/stats/platform':
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: mockStats
          })
        };

      case '/api/v1/auth/nonce':
        if (httpMethod === 'POST') {
          const { address } = JSON.parse(body || '{}');
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              data: {
                nonce: Math.floor(Math.random() * 1000000).toString(),
                address
              }
            })
          };
        }
        break;

      case '/api/v1/predictions':
        if (httpMethod === 'POST') {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              message: 'Prediction recorded (demo mode)',
              data: {
                id: 'demo-prediction-' + Date.now(),
                status: 'pending'
              }
            })
          };
        } else if (httpMethod === 'GET') {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              data: {
                predictions: [],
                total: 0,
                page: 1,
                limit: 20
              }
            })
          };
        }
        break;

      case '/api/v1/leaderboard/top-winners':
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: [
              {
                rank: 1,
                address: '0x1234...5678',
                username: 'CryptoTrader',
                totalWinnings: '5000.25',
                winCount: 45,
                roi: 125.5
              },
              {
                rank: 2,
                address: '0x2345...6789',
                username: 'PredictionMaster',
                totalWinnings: '4250.80',
                winCount: 38,
                roi: 98.2
              }
            ]
          })
        };

      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Endpoint not found (demo mode)',
            availableEndpoints: [
              '/api/v1/rounds/current',
              '/api/v1/stats/platform',
              '/api/v1/auth/nonce',
              '/api/v1/predictions',
              '/api/v1/leaderboard/top-winners'
            ]
          })
        };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Method not allowed'
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error.message
      })
    };
  }
};
