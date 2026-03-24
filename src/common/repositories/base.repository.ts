import { Model } from 'mongoose';

export class BaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  async findAll(filter: Record<string, any> = {}) {
    return this.model.find({ ...filter, isDeleted: false });
  }

  async findOne(filter: Record<string, any>) {
    return this.model.findOne({ ...filter, isDeleted: false });
  }

  async findById(id: string) {
    return this.model.findOne({ _id: id, isDeleted: false });
  }

  async create(data: Partial<T>) {
    return this.model.create(data);
  }

  async update(id: string, data: Partial<T>) {
    return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, data, {
      new: true,
    });
  }

  async updateOne(filter: Record<string, any>, data: Partial<T>) {
    return this.model.updateOne({ ...filter, isDeleted: false }, data);
  }

  async softDelete(id: string) {
    return this.model.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true },
    );
  }

  async softDeleteOne(filter: Record<string, any>) {
    return this.model.updateOne(
      { ...filter, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
    );
  }

  async restore(id: string) {
    return this.model.findOneAndUpdate(
      { _id: id, isDeleted: true },
      {
        isDeleted: false,
        deletedAt: null,
      },
      { new: true },
    );
  }

  async hardDelete(id: string) {
    return this.model.findByIdAndDelete(id);
  }
}
