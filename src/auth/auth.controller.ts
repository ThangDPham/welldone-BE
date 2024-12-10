import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  Patch,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators';
import { JwtAuthGuard, LocalAuthGuard } from './guards';
import { EmailService } from '../shared/services/email.service';
import {
  LoginDto,
  LoginResponseDto,
  LoginUnverifiedResponseDto,
  SignupDto,
  VerifyCodeDto,
  ResendVerificationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';
import { UsersService } from 'src/users/users.service';
import { UpdateUserDto } from 'src/users/dto';
import { UpdateProfile } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
  ) {}

  @Post('signup')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account and sends verification email',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered. Verification email sent.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or email already exists',
  })
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticates user credentials and returns access token',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: () => LoginResponseDto,
  })
  @ApiResponse({
    status: 200,
    description: 'User needs to verify email',
    type: () => LoginUnverifiedResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('verify-email')
  @ApiOperation({
    summary: 'Verify email address',
    description: 'Verifies user email using the verification code',
  })
  @ApiResponse({
    status: 200,
    description: 'Email successfully verified',
  })
  @ApiBadRequestResponse({
    description: 'Invalid or expired verification code',
  })
  async verifyEmail(@Body() verifyCodeDto: VerifyCodeDto) {
    return this.authService.verifyEmail(verifyCodeDto);
  }

  @Post('resend-verification')
  @ApiOperation({
    summary: 'Resend verification code',
    description: 'Sends a new verification code to the user email',
  })
  @ApiResponse({
    status: 200,
    description: 'Verification code sent successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid email or already verified',
  })
  async resendVerification(@Body() resendDto: ResendVerificationDto) {
    return this.authService.resendVerificationCode(resendDto.email);
  }

  @Get('test-email')
  @ApiOperation({
    summary: 'Test email configuration',
    description: 'Sends a test email to verify SMTP settings',
  })
  @ApiQuery({
    name: 'email',
    required: true,
    description: 'Email address to send test email to',
  })
  async testEmail(@Query('email') email: string) {
    try {
      await this.emailService.sendTestEmail(email);
      return { message: 'Test email sent successfully' };
    } catch (error) {
      return {
        error: 'Failed to send test email',
        details: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the profile of the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Not authenticated or invalid token',
  })
  async getProfile(@CurrentUser() user) {
    return this.authService.getProfile(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('updateProfile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update current user profile',
    description: 'change the profile of the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Not authenticated or invalid token',
  })
  async updateProfile(@CurrentUser() user, @Body() updateProfile : UpdateProfile) {
    return await this.usersService.update(user.id, updateProfile);
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Sends a password reset code to the provided email',
  })
  @ApiResponse({
    status: 200,
    description: 'Reset code sent if email exists',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password',
    description: 'Reset password using the code sent to email',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
  })
  @ApiBadRequestResponse({
    description: 'Invalid or expired reset code',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('reset-password')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the profile of the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Password has been changed successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Not authenticated or invalid token',
  })
  
  async changePassword(@CurrentUser() user, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(user.id, changePasswordDto);
  }
}
