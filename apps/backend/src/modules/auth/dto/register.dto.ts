import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Mariana Alumna' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  fullName: string;

  @ApiProperty({ example: 'alumno@instituto.com' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @ApiProperty({ example: 'ILTCT-2026-MEX', description: 'Código de franquicia obligatorio emitido por el instituto' })
  @IsString()
  @IsNotEmpty({ message: 'El código de franquicia es obligatorio para el registro' })
  franchiseCode: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
