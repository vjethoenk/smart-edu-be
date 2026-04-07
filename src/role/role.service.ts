import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { Model } from 'mongoose';
import { IUser } from 'src/user/user.interface';

@Injectable()
export class RoleService {
  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async create(createRoleDto: CreateRoleDto) {
    const checkName = await this.roleModel.findOne({
      name: createRoleDto.name,
    });
    if (checkName) {
      throw new BadRequestException('Name đã tồn tại');
    }
    return await this.roleModel.create({
      ...createRoleDto,
      // createBy: {
      //   _id: user._id,
      //   email: user.email,
      // },
    });
  }

  findAll() {
    return this.roleModel.find().exec();
  }

  findOne(id: string) {
    return this.roleModel.findById(id).exec();
  }

  update(id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    return this.roleModel
      .findByIdAndUpdate(
        id,
        { ...updateRoleDto, updateBy: { _id: user._id, email: user.email } },
        { new: true },
      )
      .exec();
  }

  remove(id: string) {
    return this.roleModel.findByIdAndDelete(id).exec();
  }
}
