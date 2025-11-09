
import { POST, DELETE } from '../route';
import { NextRequest } from 'next/server';
import { Chain, User } from '@/models';
import connectMongoDB from '@/lib/db';

jest.mock('@/lib/db');
jest.mock('@/models/Chain');
jest.mock('@/models/User');

describe('POST /api/protected/chain', () => {
    const mockConnectMongoDB = connectMongoDB as jest.Mock;
    const mockChainCreate = Chain.create as jest.Mock;
    const mockUserFindById = User.findById as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockConnectMongoDB.mockResolvedValue(true);
    });

    it('should create a new chain', async () => {
        const formData = new FormData();
        formData.append('base', '10');

        const req = new NextRequest('http://localhost/api/protected/chain', {
            method: 'POST',
            headers: { _id: 'userId1' },
            body: formData,
        });

        const mockNewChain = { _id: 'chain1', author: 'userId1', base: 10, save: jest.fn(), populate: jest.fn().mockResolvedValue({ _id: 'chain1', author: 'userId1', base: 10 }) };
        mockChainCreate.mockResolvedValue(mockNewChain);

        const mockUser = { _id: 'userId1', chains: [], save: jest.fn() };
        mockUserFindById.mockResolvedValue(mockUser);

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data).toEqual({ _id: 'chain1', author: 'userId1', base: 10 });
        expect(mockChainCreate).toHaveBeenCalledWith({ author: 'userId1', base: 10 });
        expect(mockNewChain.save).toHaveBeenCalled();
        expect(mockUser.chains).toContain('chain1');
        expect(mockUser.save).toHaveBeenCalled();
    });

    it('should return 400 if base is not provided', async () => {
        const formData = new FormData();

        const req = new NextRequest('http://localhost/api/protected/chain', {
            method: 'POST',
            headers: { _id: 'userId1' },
            body: formData,
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data).toEqual({ error: 'Base is required' });
    });
});

describe('DELETE /api/protected/chain', () => {
    const mockConnectMongoDB = connectMongoDB as jest.Mock;
    const mockChainFindById = Chain.findById as jest.Mock;
    const mockChainFindByIdAndDelete = Chain.findByIdAndDelete as jest.Mock;
    const mockUserFindById = User.findById as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockConnectMongoDB.mockResolvedValue(true);
    });

    it('should delete a chain', async () => {
        const req = new NextRequest('http://localhost/api/protected/chain?id=chain1', {
            method: 'DELETE',
            headers: { _id: 'userId1' },
        });

        const mockChain = { _id: 'chain1', author: 'userId1' };
        mockChainFindById.mockResolvedValue(mockChain);
        mockChainFindByIdAndDelete.mockResolvedValue(true);

        const mockUser = { _id: 'userId1', chains: ['chain1'], save: jest.fn() };
        mockUserFindById.mockResolvedValue(mockUser);

        const res = await DELETE(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data).toEqual({ message: 'Chain deleted' });
        expect(mockChainFindByIdAndDelete).toHaveBeenCalledWith('chain1');
        expect(mockUser.chains).not.toContain('chain1');
        expect(mockUser.save).toHaveBeenCalled();
    });

    it('should return 404 if chain not found', async () => {
        const req = new NextRequest('http://localhost/api/protected/chain?id=chain1', {
            method: 'DELETE',
            headers: { _id: 'userId1' },
        });

        mockChainFindById.mockResolvedValue(null);

        const res = await DELETE(req);
        const data = await res.json();

        expect(res.status).toBe(404);
        expect(data).toEqual({ error: 'Chain not found' });
    });
});
