
import { rest } from \'msw\';

export const handlers = [
  // Auth endpoints
  rest.post(\'/v1/auth/login\', (req, res, ctx) => {
    return res(
      ctx.json({
        user: {
          id: \'1\',
          name: \'Test User\',
          email: \'test@example.com\',
          businesses: [
            {
              id: \'business-1\',
              name: \'Test Business\',
              role: \'admin\',
            },
          ],
        },
        access_token: \'mock-access-token\',
        refresh_token: \'mock-refresh-token\',
      })
    );
  }),

  rest.post(\'/v1/auth/refresh\', (req, res, ctx) => {
    return res(
      ctx.json({
        access_token: \'new-mock-access-token\',
        refresh_token: \'new-mock-refresh-token\',
      })
    );
  }),

  // Contacts endpoints
  rest.get(\'/v1/contacts\', (req, res, ctx) => {
    const page = req.url.searchParams.get(\'page\') || \'1\';
    const limit = req.url.searchParams.get(\'limit\') || \'20\';
    const search = req.url.searchParams.get(\'search\');

    let contacts = [
      {
        id: \'1\',
        full_name: \'João Silva\',
        phone: \'+5511999999999\',
        email: \'joao@example.com\',
        tags: [\'cliente\', \'vip\'],
        engagement_score: 85,
        created_at: \'2024-01-01T00:00:00Z\',
      },
      {
        id: \'2\',
        full_name: \'Maria Santos\',
        phone: \'+5511888888888\',
        email: \'maria@example.com\',
        tags: [\'prospect\'],
        engagement_score: 65,
        created_at: \'2024-01-02T00:00:00Z\',
      },
    ];

    // Simula busca
    if (search) {
      contacts = contacts.filter(contact =>
        contact.full_name.toLowerCase().includes(search.toLowerCase()) ||
        contact.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    return res(
      ctx.json({
        data: contacts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: contacts.length,
          totalPages: Math.ceil(contacts.length / parseInt(limit)),
        },
      })
    );
  }),

  rest.post(\'/v1/contacts\', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: \'3\',
        full_name: \'Novo Contato\',
        phone: \'+5511777777777\',
        email: \'novo@example.com\',
        tags: [\'prospect\'],
        engagement_score: 0,
        created_at: new Date().toISOString(),
      })
    );
  }),

  // Dashboard metrics
  rest.get(\'/v1/dashboard/metrics\', (req, res, ctx) => {
    return res(
      ctx.json({
        contacts: {
          total: 1250,
          new_this_month: 85,
          growth_rate: 12.5,
        },
        messages: {
          sent_today: 342,
          delivered_rate: 98.5,
          response_rate: 24.3,
        },
        journeys: {
          active: 8,
          total_enrolled: 450,
          avg_conversion: 18.7,
        },
        agents: {
          active_conversations: 12,
          avg_response_time: 2.3,
          satisfaction_score: 4.6,
        },
      })
    );
  }),

  // Error simulation
  rest.get(\'/v1/error-test\', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ error: \'Internal server error\' }));
  }),
];


