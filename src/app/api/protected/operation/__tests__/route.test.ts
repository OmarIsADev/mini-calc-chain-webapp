
import { POST, DELETE } from '../route';
import { NextRequest } from 'next/server';
import { Chain, Operation } from '@/models/Chain';
import connectMongoDB from '@/lib/db';

jest.mock('@/lib/db');
jest.mock('@/models/Chain');

describe('POST /api/protected/operation', () => {
    const mockConnectMongoDB = connectMongoDB as jest.Mock;
    const mockOperationCreate = Operation.create as jest.Mock;
    const mockChainFindById = Chain.findById as jest.Mock;
    const mockOperationFindById = Operation.findById as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockConnectMongoDB.mockResolvedValue(true);
    });

    it('should create a new operation and add it to a chain', async () => {
        const formData = new FormData();
        formData.append('operation', '+5');
        formData.append('chainId', 'chainId1');

        const req = new NextRequest('http://localhost/api/protected/operation', {
            method: 'POST',
            headers: { _id: 'userId1' },
            body: formData,
        });

        const mockNewOperation = { _id: 'op1', author: 'userId1', base: '+5', populate: jest.fn().mockResolvedValue({ _id: 'op1', author: 'userId1', base: '+5' }) };
        mockOperationCreate.mockResolvedValue(mockNewOperation);

        const mockChain = { _id: 'chainId1', operations: [], save: jest.fn() };
        mockChainFindById.mockResolvedValue(mockChain);

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data).toEqual({ _id: 'op1', author: 'userId1', base: '+5' });
        expect(mockOperationCreate).toHaveBeenCalledWith({ author: 'userId1', base: '+5' });
        expect(mockChain.operations).toContain('op1');
        expect(mockChain.save).toHaveBeenCalled();
    });

    it('should return 400 for invalid operation', async () => {
        const formData = new FormData();
        formData.append('operation', 'abc');
        formData.append('chainId', 'chainId1');

        const req = new NextRequest('http://localhost/api/protected/operation', {
            method: 'POST',
            headers: { _id: 'userId1' },
            body: formData,
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data).toEqual({ error: 'Invalid operation' });
    });
});

describe('DELETE /api/protected/operation', () => {
    const mockConnectMongoDB = connectMongoDB as jest.Mock;
    const mockOperationFindById = Operation.findById as jest.Mock;
    const mockChainUpdateMany = Chain.updateMany as jest.Mock;
    const mockOperationUpdateMany = Operation.updateMany as jest.Mock;


    beforeEach(() => {
        jest.clearAllMocks();
        mockConnectMongoDB.mockResolvedValue(true);
    });

    it('should delete an operation', async () => {
        const req = new NextRequest('http://localhost/api/protected/operation?id=op1', {
            method: 'DELETE',
            headers: { _id: 'userId1' },
        });

        const mockOperation = {
            _id: 'op1',
            author: 'userId1',
            operations: [],
            deleteOne: jest.fn().mockResolvedValue(true),
        };
        mockOperationFindById.mockResolvedValue(mockOperation);
        mockChainUpdateMany.mockResolvedValue({ });
        mockOperationUpdateMany.mockResolvedValue({ });

        const res = await DELETE(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data).toEqual({ message: 'Operation deleted' });
        expect(mockOperation.deleteOne).toHaveBeenCalled();
    });

    it('should return 404 if operation not found', async () => {
        const req = new NextRequest('http://localhost/api/protected/operation?id=op1', {
            method: 'DELETE',
            headers: { _id: 'userId1' },
        });

        mockOperationFindById.mockResolvedValue(null);

        const res = await DELETE(req);
        const data = await res.json();

        expect(res.status).toBe(404);
        expect(data).toEqual({ error: 'Operation not found' });
    });

    it('should return 403 if user is not authorized', async () => {
        const req = new NextRequest('http://localhost/api/protected/operation?id=op1', {
            method: 'DELETE',
            headers: { _id: 'userId2' },
        });

        const mockOperation = {
            _id: 'op1',
            author: 'userId1',
            operations: [],
            deleteOne: jest.fn(),
        };
        mockOperationFindById.mockResolvedValue(mockOperation);

        const res = await DELETE(req);
        const data = await res.json();

        expect(res.status).toBe(403);
        expect(data).toEqual({ error: 'You are not authorized to delete this operation' });
    });
});
