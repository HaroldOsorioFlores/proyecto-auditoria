import { Module } from '@nestjs/common';
import { TaskModule } from './task/task.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        type: 'oracle' as const,
        connectString: 'localhost:1521/FREEPDB1',
        username: 'admin',
        password: 'admin',
        synchronize: true,
        autoLoadEntities: true,
        keepConnectionAlive: true,
        retryAttempts: 3,
        retryDelay: 3000,
        connectTimeoutMS: 10000,
        extra: {
          poolMax: 20,
          poolMin: 1,
          queueTimeout: 5000,
          enableReadyCheck: false,
        },
      }),
    }),

    TypeOrmModule.forRootAsync({
      name: 'secondary',
      useFactory: async () => ({
        type: 'oracle' as const,
        connectString: 'localhost:1522/FREEPDB1',
        username: 'admin',
        password: 'admin',
        synchronize: true,
        autoLoadEntities: true,
        keepConnectionAlive: true,
        retryAttempts: 3,
        retryDelay: 3000,
        connectTimeoutMS: 10000,
        extra: {
          poolMax: 20,
          poolMin: 1,
          queueTimeout: 5000,
          enableReadyCheck: false,
        },
      }),
    }),

    TaskModule,
  ],
})
export class AppModule {}
