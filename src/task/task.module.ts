import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { Task } from './entities/task.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),

    TypeOrmModule.forFeature([Task], 'secondary'),
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
