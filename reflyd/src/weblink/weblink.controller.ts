import { Controller, Get, Post, Query, Request, UseGuards, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { WeblinkService } from './weblink.service';
import { GetWebLinkListResponse, PingWeblinkResponse, StoreWebLinkParam } from './weblink.dto';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { LoggerService } from 'src/common/logger.service';

@Controller('weblink')
export class WeblinkController {
  constructor(private logger: LoggerService, private weblinkService: WeblinkService) {
    this.logger.setContext(WeblinkController.name);
  }

  @UseGuards(JwtAuthGuard)
  @Get('ping')
  async ping(@Query('url') url: string): Promise<PingWeblinkResponse> {
    if (!url) return { status: 'unavailable' };
    await this.weblinkService.processLinkFromStoreQueue({ url });
    return {
      status: (await this.weblinkService.checkWeblinkExists(url)) ? 'ok' : 'unavailable',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('store')
  async store(@Request() req, @Body() body: StoreWebLinkParam) {
    this.logger.log(`user: ${req.user.id}, store link: ${body}`);
    await this.weblinkService.storeLinks(req.user.uid, body.data);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('list')
  @ApiQuery({ name: 'linkId', type: String, required: false })
  @ApiQuery({ name: 'url', type: String, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  @ApiOkResponse({ type: GetWebLinkListResponse })
  async list(
    @Request() req,
    @Query('linkId') linkId,
    @Query('url') url,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    this.logger.log(
      `weblink list where: ${JSON.stringify({
        linkId,
        url,
        userId: req.user.id,
      })}`,
    );
    const weblinkList = await this.weblinkService.getUserHistory({
      skip,
      take,
      where: { id: linkId, url, userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
    });

    return {
      data: weblinkList,
    };
  }
}
