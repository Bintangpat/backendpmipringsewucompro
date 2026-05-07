import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

export const RegisterSchema = LoginSchema.extend({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Format email tidak valid'),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token diperlukan'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

export class LoginDto extends createZodDto(LoginSchema) {}
export class RegisterDto extends createZodDto(RegisterSchema) {}
export class ForgotPasswordDto extends createZodDto(ForgotPasswordSchema) {}
export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {}
