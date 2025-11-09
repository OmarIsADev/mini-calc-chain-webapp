
import { POST } from '../route';
import { NextRequest } from 'next/server';
import { User } from '@/models';
import connectMongoDB from '@/lib/db';
import { hash } from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('@/lib/db');
jest.mock('@/models/User');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('POST /api/auth/signup', () => {
    const mockConnectMongoDB = connectMongoDB as jest.Mock;
    const mockUserFindOne = User.findOne as jest.Mock;
    const mockUserCreate = User.create as jest.Mock;
    const mockHash = hash as jest.Mock;
    const mockJwtSign = jwt.sign as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockConnectMongoDB.mockResolvedValue(true);
        process.env.JWT_SECRET_KEY = 'test-secret';
    });

    it('should create a new user and return a token', async () => {
        const formData = new FormData();
        formData.append('username', 'testuser');
        formData.append('password', 'password123');

        const req = new NextRequest('http://localhost/api/auth/signup', {
            method: 'POST',
            body: formData,
        });

        mockUserFindOne.mockResolvedValue(null);
        mockHash.mockResolvedValue('hashedpassword');
        const mockNewUser = { _id: 'userId1', username: 'testuser', password: 'hashedpassword' };
        mockUserCreate.mockResolvedValue(mockNewUser);
        mockJwtSign.mockReturnValue('test-token');

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(201);
        expect(data).toEqual({ message: 'Signup successful' });
        expect(res.headers.get('Set-Cookie')).toContain('token=test-token');
    });

    it('should return 400 if username already exists', async () => {
        const formData = new FormData();
        formData.append('username', 'testuser');
        formData.append('password', 'password123');

        const req = new NextRequest('http://localhost/api/auth/signup', {
            method: 'POST',
            body: formData,
        });

        mockUserFindOne.mockResolvedValue({ _id: 'userId1', username: 'testuser' });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data).toEqual({ error: 'username already exists' });
    });

    it('should return 400 if username or password are too short', async () => {
        const formData = new FormData();
        formData.append('username', 'tu');
        formData.append('password', 'pw');

        const req = new NextRequest('http://localhost/api/auth/signup', {
            method: 'POST',
            body: formData,
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data).toEqual({ error: 'username or password are too short' });
    });
});
