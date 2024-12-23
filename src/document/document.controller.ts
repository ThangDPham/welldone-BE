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


import { Request, Response} from 'express';
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
import path, { join } from 'path';
import { UploadFileRequest } from './dto';
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
            if (!file.originalname.match(/\.(pdf|docx|txt)$/)) {
                return callback(new Error('Only.pdf files are allowed.'), false);
            }
            callback(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 }, // 2MB
        dest: process.cwd()+'/uploads',
    }))
    @ApiConsumes('multipart/form-data')
    upload(
        @Req() req: Request,
        @UploadedFile() file,
        @CurrentUser() user
    ) {
        if (!file) {
            throw new Error('Invalid file');
        }
        return this.documentService.create(req, file,user.id);
    }

    @Get(':id')
    getFileUsingStaticValues( @Param('id') id : number) {
        return this.documentService.download(id);
    }
    @Delete(':id')
    @ApiOperation({ summary: 'Delete File' })
    @ApiNotFoundResponse({description: 'File not found'})
    @ApiForbiddenResponse({description: 'You do not have permission to edit this file'})
    deleteFile(@Param('id') id : number,@CurrentUser() user) {
        return this.documentService.deleteFile(id,user.id);
    }
    
}
