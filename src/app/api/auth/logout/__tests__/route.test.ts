
import { GET } from '../route';

describe('GET /api/auth/logout', () => {
    it('should clear the token cookie', async () => {
        const res = await GET();
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data).toEqual({ message: 'logged out' });
        expect(res.headers.get('Set-Cookie')).toContain('token=;');
        expect(res.headers.get('Set-Cookie')).toContain('Max-Age=0');
    });
});
