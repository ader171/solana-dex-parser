import { Connection } from '@solana/web3.js';
import dotenv from 'dotenv';
import { PumpfunEventParser } from '../parsers';
import { TransactionAdapter } from '../transaction-adapter';
import { PumpfunEvent } from '../types';

dotenv.config();

describe('Pumpfun Parser', () => {
  let connection: Connection;

  beforeAll(() => {
    const rpcUrl = process.env.SOLANA_RPC_URL;
    if (!rpcUrl) {
      throw new Error('SOLANA_RPC_URL environment variable is not set');
    }
    connection = new Connection(rpcUrl);
  });

  describe('Pumpfun Events Parsing', () => {
    it('should correctly parse Pumpfun events from a transaction', async () => {
      const txSignature = '2CYBHseAoZy1WHTNnVj1cTV9gnDeXE5WHAq6xXP62RL6h54uN1ft1AM1r5VkhMXYtav54CaP4nbR2rDe5TZdPzbR';

      const tx = await connection.getTransaction(txSignature, {
        maxSupportedTransactionVersion: 0,
      });

      if (!tx) {
        throw new Error(`Transaction not found: ${txSignature}`);
      }

      const parser = new PumpfunEventParser(new TransactionAdapter(tx));
      const events = parser.processEvents();

      console.log(events);

      expect(events.length).toBeGreaterThan(0);

      // Validate each event
      events.forEach((event: PumpfunEvent) => {
        expect(event).toHaveProperty('type');
        expect(['TRADE', 'CREATE', 'COMPLETE']).toContain(event.type);

        expect(event).toHaveProperty('data');
        expect(typeof event.data).toBe('object');

        expect(event).toHaveProperty('slot');
        expect(typeof event.slot).toBe('number');

        expect(event).toHaveProperty('timestamp');
        expect(typeof event.timestamp).toBe('number');

        expect(event).toHaveProperty('signature');
        expect(typeof event.signature).toBe('string');

        expect(event).toHaveProperty('idx');
        expect(typeof event.idx).toBe('string');

        // Additional type-specific validation
        switch (event.type) {
          case 'TRADE':
            expect(event.data).toHaveProperty('mint');
            expect(typeof event.data.mint).toBe('string');

            expect(event.data).toHaveProperty('solAmount');
            expect(typeof event.data.solAmount).toBe('bigint');

            expect(event.data).toHaveProperty('tokenAmount');
            expect(typeof event.data.tokenAmount).toBe('bigint');

            expect(event.data).toHaveProperty('isBuy');
            expect(typeof event.data.isBuy).toBe('boolean');

            expect(event.data).toHaveProperty('user');
            expect(typeof event.data.user).toBe('string');
            break;

          case 'CREATE':
            expect(event.data).toHaveProperty('name');
            expect(typeof event.data.name).toBe('string');

            expect(event.data).toHaveProperty('symbol');
            expect(typeof event.data.symbol).toBe('string');

            expect(event.data).toHaveProperty('uri');
            expect(typeof event.data.uri).toBe('string');

            expect(event.data).toHaveProperty('mint');
            expect(typeof event.data.mint).toBe('string');

            expect(event.data).toHaveProperty('bondingCurve');
            expect(typeof event.data.bondingCurve).toBe('string');

            expect(event.data).toHaveProperty('user');
            expect(typeof event.data.user).toBe('string');
            break;

          case 'COMPLETE':
            expect(event.data).toHaveProperty('user');
            expect(typeof event.data.user).toBe('string');

            expect(event.data).toHaveProperty('mint');
            expect(typeof event.data.mint).toBe('string');

            expect(event.data).toHaveProperty('bondingCurve');
            expect(typeof event.data.bondingCurve).toBe('string');

            expect(event.data).toHaveProperty('timestamp');
            expect(typeof event.data.timestamp).toBe('bigint');
            break;
        }
      });
    });
  });
});
