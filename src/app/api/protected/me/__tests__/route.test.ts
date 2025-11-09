
import { GET } from '../route';
import { NextRequest } from 'next/server';
import { User } from '@/models';
import connectMongoDB from '@/lib/db';

jest.mock('@/lib/db');
jest.mock('@/models/User');

describe('GET /api/protected/me', () => {
    const mockConnectMongoDB = connectMongoDB as jest.Mock;
    const mockUserFindById = User.findById as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockConnectMongoDB.mockResolvedValue(true);
    });

    it('should return the authenticated user', async () => {
        const req = new NextRequest('http://localhost/api/protected/me', {
            headers: { _id: 'userId1' },
        });

        const mockUser = { _id: 'userId1', username: 'testuser' };
        mockUserFindById.mockResolvedValue(mockUser);

        const res = await GET(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data).toEqual({ user: mockUser });
        expect(mockUserFindById).toHaveBeenCalledWith('userId1');
    });

    it('should return 404 if user not found', async () => {
        const req = new NextRequest('http://localhost/api/protected/me', {
            headers: { _id: 'userId1' },
        });

        mockUserFindById.mockResolvedValue(null);

        const res = await GET(req);
        const data = await res.json();

        expect(res.status).toBe(404);
        expect(data).toEqual({ error: 'User not found' });
    });
});
