import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TaskPriority, TaskStatus } from '../enums/task-status.enum';

export type TaskDocument = Task & Document<Types.ObjectId>;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true, default: '' })
  description: string;

  @Prop({ type: String, enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Prop({ type: String, enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
  project: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  assignee: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  dueDate: Date | null;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.index({ project: 1, status: 1 });
