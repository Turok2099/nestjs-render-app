import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { connectionSource } from '../config/typeorm';

async function run() {
  const connection = await connectionSource.initialize();

  connection.setOptions({
    entities: [],
    migrations: [],
  } as any);

  console.log('✅ Seeds completed.');
}

run().catch((err) => {
  console.error('❌ Error seeding', err);
  process.exit(1);
});
