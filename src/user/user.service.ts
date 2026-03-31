import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { genSaltSync, hashSync, compareSync } from 'bcrypt';
import { Role, RoleDocument } from 'src/role/schemas/role.schema';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  getHashPassword = (password: string) => {
    const saltRounds = 10;
    const salt = genSaltSync(saltRounds);
    const hash = hashSync(password, salt);
    return hash;
  };

  async create(createUserDto: CreateUserDto) {
    const hashPassword = this.getHashPassword(createUserDto.password);

    let user = await this.userModel.create({
      ...createUserDto,
      password: hashPassword,
    });
    return user;
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID');
    }
    return this.userModel.findOne({ _id: id });
  }

  findOneByUserName(username: string) {
    return this.userModel
      .findOne({
        email: username,
      })
      .populate({
        path: 'role',
        select: { name: 1 },
      });
  }

  checkUserPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID');
    }
    const hashPassword = this.getHashPassword(updateUserDto.password as string);
    let user = await this.userModel.updateOne(
      { _id: id },
      { ...updateUserDto, password: hashPassword },
    );
    return user;
  }

  async remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID');
    }

    return this.userModel.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true },
    );
  }

  updateRefreshToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne({ _id }, { refreshToken });
  };

  findRefreshToken = async (refreshToken: string) => {
    return await this.userModel.findOne({ refreshToken }).populate({
      path: 'role',
      select: { name: 1 },
    });
  };

  async register(registerDto: RegisterUserDto) {
    const getByRoleUser = await this.roleModel.findOne({ name: 'USER' });
    const pass = this.getHashPassword(registerDto.password);
    registerDto.password = pass;

    if (getByRoleUser?._id) {
      registerDto.role = getByRoleUser._id;
    } else {
      console.error('Không tìm thấy role user để gán!');
    }

    const newUser = await this.userModel.create({ ...registerDto });

    console.log('UserId:', newUser._id);

    return {
      message: 'Đăng ký thành công',
      userId: newUser?._id,
    };
  }
}
