import { initializeDB } from "../src/db";


describe("Database", () => {
  it('Database Connectivity', async () => {
    const pool = await initializeDB()
    expect(pool).toBeDefined();
  });
});

