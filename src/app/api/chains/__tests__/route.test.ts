
import { GET } from '../route';
import { NextRequest } from 'next/server';
import { Chain, Operation } from '@/models/Chain';
import connectMongoDB from '@/lib/db';

jest.mock('@/lib/db');
jest.mock('@/models/Chain');

describe('GET /api/chains', () => {
  const mockConnectMongoDB = connectMongoDB as jest.Mock;
  const mockChainFind = Chain.find as jest.Mock;
  const mockChainFindById = Chain.findById as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConnectMongoDB.mockResolvedValue(true);
  });

  it('should return all chains', async () => {
    const mockChains = [
      { _id: "1", name: "Chain 1" },
      { _id: "2", name: "Chain 2" },
    ];

    const populatedChains = mockChains.map((c) => ({
      ...c,
      author: "populated author",
      operations: [],
      toObject: () => ({ ...c, author: "populated author", operations: [] }),
    }));

    const chainsWithPopulate = mockChains.map((chain, index) => ({
      ...chain,
      populate: jest.fn().mockResolvedValue(populatedChains[index]),
    }));

    mockChainFind.mockResolvedValue(chainsWithPopulate);

    const req = new NextRequest("http://localhost/api/chains");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(populatedChains.map((p) => p.toObject()));
    expect(mockConnectMongoDB).toHaveBeenCalledTimes(1);
    expect(mockChainFind).toHaveBeenCalledWith();
  });

  // it('should return chains by authorId', async () => {
  //   const mockChains = [{ _id: '1', name: 'Chain 1', author: 'author1' }];
  //   mockChainFind.mockResolvedValue(mockChains);

  //   const req = new NextRequest('http://localhost/api/chains?authorId=author1');
  //   const res = await GET(req);
  //   const data = await res.json();

  //   expect(res.status).toBe(200);
  //   expect(data).toEqual(mockChains);
  //   expect(mockChainFind).toHaveBeenCalledWith({ author: 'author1' });
  // });

  // it('should return a chain by chainId', async () => {
  //   const mockChain = { _id: '1', name: 'Chain 1' };
  //   mockChainFindById.mockResolvedValue(mockChain);

  //   const req = new NextRequest('http://localhost/api/chains?chainId=1');
  //   const res = await GET(req);
  //   const data = await res.json();

  //   expect(res.status).toBe(200);
  //   expect(data).toEqual(mockChain);
  //   expect(mockChainFindById).toHaveBeenCalledWith('1');
  // });

  it('should return 404 if chain not found by chainId', async () => {
    mockChainFindById.mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/chains?chainId=1');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data).toEqual({ error: 'Chain not found' });
  });

  it('should return 404 if chains not found by authorId', async () => {
    mockChainFind.mockResolvedValue([]);

    const req = new NextRequest('http://localhost/api/chains?authorId=author1');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data).toEqual({ error: 'Chains not found' });
  });
});
