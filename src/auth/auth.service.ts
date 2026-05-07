import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && user.password) {
      const isMatch = await bcrypt.compare(pass, user.password);
      if (isMatch) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('Email sudah terdaftar');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.userService.create({
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name,
    });

    const { password, ...result } = user;
    return result;
  }

  async googleLogin(profile: { email: string; name: string; image: string }) {
    let user = await this.userService.findByEmail(profile.email);
    if (!user) {
      user = await this.userService.create({
        email: profile.email,
        name: profile.name || 'Unknown User',
        image: profile.image || null,
        password: null, // No password for Google OAuth
      });
    }
    return this.login(user);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      // Return success even if not found to prevent email enumeration
      return { message: 'Jika email terdaftar, link reset telah dikirim.' };
    }

    const payload = { email: user.email, sub: user.id };
    const resetToken = this.jwtService.sign(payload, { expiresIn: '1h' });

    await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'Jika email terdaftar, link reset telah dikirim.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const payload = this.jwtService.verify(resetPasswordDto.token);
      const user = await this.userService.findByEmail(payload.email);
      if (!user) {
        throw new NotFoundException('User tidak ditemukan');
      }

      const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);
      await this.userService.update(user.id, { password: hashedPassword });

      return { message: 'Password berhasil direset' };
    } catch (e) {
      throw new BadRequestException('Token tidak valid atau sudah kadaluarsa');
    }
  }
}
