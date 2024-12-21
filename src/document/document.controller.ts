import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ParseFilePipeBuilder,
  HttpStatus,
  UploadedFile,
  Req,
  Res,
  Header,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiUnprocessableEntityResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards';

import { CurrentUser } from 'src/auth/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { console } from 'inspector';
import { createReadStream } from 'fs';
import { join } from 'path';
@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {

    
    constructor(private readonly documentService: DocumentService) {}
    @Post('upload')
    @ApiOperation({ summary: 'Create a new file' })
    @ApiNotFoundResponse({description: 'not found'})
    @ApiForbiddenResponse({description: 'unauthorized'})
    @ApiUnprocessableEntityResponse({description: 'bad request'})
    @ApiInternalServerErrorResponse({description: 'Internal Server Error'})
    @UseInterceptors(FileInterceptor('file', {
        fileFilter: (req, file, callback) => {
            if (!file.originalname.match(/\.(pdf)$/)) {
                return callback(new Error('Only.pdf files are allowed.'), false);
            }
            callback(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 }, // 2MB
        dest: './uploads/',
        
    }))
    @ApiConsumes('multipart/form-data')
    upload(
        @Req() req: any,
        @UploadedFile(
            
        ) file
    ) {
        if (!file || req.fileValdationError) {
            throw new Error('Invalid file');
        }
        return file;
        // return this.documentService.create(req,file);
    }

    @Get()
    @Header('Content-Type', 'application/pdf')
    @Header('Content-Disposition', 'attachment; filename="package.pdf"')
    getFileUsingStaticValues(): StreamableFile {
    const file = createReadStream(join('./uploads', '846d509a31b1f1832931a1cdb0960010'));
        return new StreamableFile(file);
    }  
}