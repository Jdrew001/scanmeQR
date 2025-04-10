import { Body, Controller, Delete, Get, HttpCode, Param, Request, Response, Patch, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QrCodesService } from '../../../../../shared/services/src/lib/qr-codes/qr-codes.service';
import { JwtAuthGuard } from '../../../../../shared/util/src/lib/auth/guards/jwt-auth.guard';
import { QrCode } from '../../../../../shared/data/src/lib/entities/qr-codes/qr-code.entity';
import { CreateQrCodeDto } from '../../../../../shared/data/src/lib/dto/qr-codes/create-qr-code.dto';
import { UpdateQrCodeDto } from '../../../../../shared/data/src/lib/dto/qr-codes/update-qr-code.dto';

@ApiTags('qr-codes')
@Controller('qr-codes')
@ApiBearerAuth()
export class QrCodesController {
  constructor(private readonly qrCodesService: QrCodesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new QR code' })
  @ApiResponse({ status: 201, description: 'The QR code has been successfully created.', type: QrCode })
  create(@Body() createQrCodeDto: CreateQrCodeDto, @Request() req) {
    return this.qrCodesService.create(createQrCodeDto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all QR codes for the current user' })
  @ApiResponse({ status: 200, description: 'Return all QR codes.', type: [QrCode] })
  findAll(@Request() req) {
    return this.qrCodesService.findAll(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get QR code by ID' })
  @ApiResponse({ status: 200, description: 'Return the QR code.', type: QrCode })
  findOne(@Param('id') id: string, @Request() req) {
    return this.qrCodesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a QR code' })
  @ApiResponse({ status: 200, description: 'The QR code has been successfully updated.', type: QrCode })
  update(@Param('id') id: string, @Body() updateQrCodeDto: UpdateQrCodeDto, @Request() req) {
    return this.qrCodesService.update(id, updateQrCodeDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a QR code' })
  @ApiResponse({ status: 204, description: 'The QR code has been successfully deleted.' })
  remove(@Param('id') id: string, @Request() req) {
    return this.qrCodesService.remove(id, req.user.id);
  }

  @Get(':id/image')
  @ApiOperation({ summary: 'Get the QR code image' })
  @ApiResponse({ status: 200, description: 'Return the QR code image.' })
  async getQrCodeImage(@Param('id') id: string, @Request() req, @Res() res: any) {
    const qrCode = await this.qrCodesService.findOne(id, req.user.id);
    const dataUrl = await this.qrCodesService.generateQrCodeImage(qrCode);
    res.set('Content-Type', 'image/png');
    res.send(Buffer.from(dataUrl.split(',')[1], 'base64'));
  }
}
