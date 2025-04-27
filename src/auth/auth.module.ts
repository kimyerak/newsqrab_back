import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

console.log('✅ JWT_SECRET in AuthModule:', process.env.JWT_SECRET);

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      // secret: process.env.JWT_SECRET,
      secret: 'newsqrab_secret_key_20250427',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [JwtStrategy],
  exports: [JwtModule],
})
export class AuthModule {}