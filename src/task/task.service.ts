import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly primaryTaskRepository: Repository<Task>,

    @InjectRepository(Task, 'secondary')
    private readonly secondaryTaskRepository: Repository<Task>,
  ) {}

  async createTask(taskData: Partial<Task>): Promise<Task> {
    let primaryTask: Task | null = null;
    let secondaryTask: Task | null = null;

    // lo mismo que el try-operation
    try {
      primaryTask = await this.primaryTaskRepository.save(taskData);
    } catch (error) {
      console.warn(
        'No se pudo guardar en la base de datos principal:',
        error.message,
      );
    }

    try {
      secondaryTask = await this.secondaryTaskRepository.save(taskData);
    } catch (error) {
      console.warn(
        'No se pudo guardar en la base de datos secundaria:',
        error.message,
      );
    }

    if (!primaryTask && !secondaryTask) {
      throw new Error('No se pudo guardar en ninguna base de datos');
    }

    return primaryTask || secondaryTask;
  }

  async getTasks(): Promise<Task[]> {
    try {
      return await this.primaryTaskRepository.find();
    } catch (primaryError) {
      console.warn(
        'Error al obtener de la base principal:',
        primaryError.message,
      );

      try {
        return await this.secondaryTaskRepository.find();
      } catch (secondaryError) {
        console.error(
          'Error al obtener de la base secundaria:',
          secondaryError.message,
        );
        throw new Error(
          'No se pudieron obtener las tareas de ninguna base de datos',
        );
      }
    }
  }

  async getTaskById(id: number): Promise<Task> {
    try {
      const task = await this.primaryTaskRepository.findOne({ where: { id } });
      if (task) return task;
    } catch (primaryError) {
      console.warn(
        'Error al obtener de la base principal:',
        primaryError.message,
      );
    }

    try {
      const task = await this.secondaryTaskRepository.findOne({
        where: { id },
      });
      if (task) return task;
    } catch (secondaryError) {
      console.error(
        'Error al obtener de la base secundaria:',
        secondaryError.message,
      );
    }

    throw new Error(`No se pudo encontrar la tarea con ID ${id}`);
  }

  async updateTask(id: number, taskData: Partial<Task>): Promise<Task> {
    let updated = false;

    try {
      await this.primaryTaskRepository.update(id, taskData);
      updated = true;
    } catch (error) {
      console.warn(
        'No se pudo actualizar en la base principal:',
        error.message,
      );
    }

    try {
      await this.secondaryTaskRepository.update(id, taskData);
      updated = true;
    } catch (error) {
      console.warn(
        'No se pudo actualizar en la base secundaria:',
        error.message,
      );
    }

    if (!updated) {
      throw new Error('No se pudo actualizar en ninguna base de datos');
    }

    return this.getTaskById(id);
  }

  async deleteTask(id: number): Promise<void> {
    let deleted = false;

    try {
      await this.primaryTaskRepository.delete(id);
      deleted = true;
    } catch (error) {
      console.warn('No se pudo eliminar de la base principal:', error.message);
    }

    try {
      await this.secondaryTaskRepository.delete(id);
      deleted = true;
    } catch (error) {
      console.warn('No se pudo eliminar de la base secundaria:', error.message);
    }

    if (!deleted) {
      throw new Error('No se pudo eliminar de ninguna base de datos');
    }
  }
}
