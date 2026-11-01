import { GET, DEFAULT_TRENDING_SEARCHES } from '../api/store/search/suggestions/route'
import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'

describe('Search Suggestions API Unit Tests', () => {
  const createMockRes = () => {
    const res: Partial<MedusaResponse> = {}
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    return res as MedusaResponse & { status: jest.Mock; json: jest.Mock }
  }

  it('returns default trending searches when query is empty', async () => {
    const req = {
      query: {},
    } as unknown as MedusaRequest

    const res = createMockRes()

    await GET(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        query: '',
        trending: DEFAULT_TRENDING_SEARCHES,
        suggestions: [],
      })
    )
  })

  it('matches matching trending searches when query is provided', async () => {
    const req = {
      query: { q: 'monstera' },
    } as unknown as MedusaRequest

    const res = createMockRes()

    await GET(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    const jsonCall = res.json.mock.calls[0][0]
    expect(jsonCall.query).toBe('monstera')
    expect(jsonCall.suggestions).toContain('Monstera Deliciosa')
    expect(jsonCall.trending).toBeDefined()
  })

  it('queries container query graph if available and formats products with thumbnails', async () => {
    const mockGraph = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'prod_123',
          title: 'Monstera Deliciosa Live Plant',
          handle: 'monstera-deliciosa',
          thumbnail: 'https://images.unsplash.com/monstera.jpg',
          categories: [{ name: 'Live Houseplants' }],
          variants: [{ prices: [{ amount: 49900 }] }],
        },
      ],
    })

    const req = {
      query: { q: 'monstera', limit: '5' },
      scope: {
        resolve: jest.fn().mockReturnValue({
          graph: mockGraph,
        }),
      },
    } as unknown as MedusaRequest

    const res = createMockRes()

    await GET(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    const jsonCall = res.json.mock.calls[0][0]
    expect(jsonCall.products).toHaveLength(1)
    expect(jsonCall.products[0]).toEqual({
      id: 'prod_123',
      title: 'Monstera Deliciosa Live Plant',
      handle: 'monstera-deliciosa',
      thumbnail: 'https://images.unsplash.com/monstera.jpg',
      category: 'Live Houseplants',
      price: 499,
    })
    expect(jsonCall.categories).toContain('Live Houseplants')
  })
})
