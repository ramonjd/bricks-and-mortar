import { supabase } from '../supabase/client';
import { getProperties, getProperty, createProperty } from './property';
import type { Property } from '@/types';

// Mock Supabase client
jest.mock('../supabase/client', () => ({
    supabase: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
    },
}));

describe('Property Service', () => {
    const mockProperty: Property = {
        id: '1',
        name: 'Test Property',
        address: '123 Test St',
        createdAt: new Date(),
        createdBy: 'user1',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getProperties', () => {
        it('fetches properties for a user', async () => {
            // Mock Supabase response
            (supabase.from as jest.Mock).mockImplementation(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({ data: [mockProperty], error: null }),
            }));

            const result = await getProperties('user1');

            expect(result).toEqual([mockProperty]);
            expect(supabase.from).toHaveBeenCalledWith('properties');
        });

        it('throws error when Supabase returns an error', async () => {
            // Mock Supabase error response
            (supabase.from as jest.Mock).mockImplementation(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({ data: null, error: new Error('Database error') }),
            }));

            await expect(getProperties('user1')).rejects.toThrow('Database error');
        });
    });

    describe('getProperty', () => {
        it('fetches a single property by id', async () => {
            // Mock Supabase response
            (supabase.from as jest.Mock).mockImplementation(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: mockProperty, error: null }),
            }));

            const result = await getProperty('1');

            expect(result).toEqual(mockProperty);
            expect(supabase.from).toHaveBeenCalledWith('properties');
        });
    });

    describe('createProperty', () => {
        it('creates a new property', async () => {
            const newProperty = {
                name: 'New Property',
                address: '456 New St',
                createdBy: 'user1',
            };

            // Mock Supabase response
            (supabase.from as jest.Mock).mockImplementation(() => ({
                insert: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { ...newProperty, id: '2', createdAt: new Date() },
                    error: null,
                }),
            }));

            const result = await createProperty(newProperty);

            expect(result).toHaveProperty('id');
            expect(result.name).toBe(newProperty.name);
            expect(supabase.from).toHaveBeenCalledWith('properties');
        });
    });
});
